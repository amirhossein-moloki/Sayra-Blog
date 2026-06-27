import json
import os
import re
import sqlite3

from bs4 import BeautifulSoup

# Fallback for psycopg2 if not available
try:
    import psycopg2
    from psycopg2.extras import RealDictCursor

    POSTGRES_AVAILABLE = True
except ImportError:
    POSTGRES_AVAILABLE = False


def transform_html_content(html, post_slug_map):
    if not html:
        return html
    soup = BeautifulSoup(html, "html.parser")
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "/media/uploads/" in src:
            img["src"] = src.replace("/media/uploads/", "/storage/media/")
        if img.has_attr("style"):
            del img["style"]
    for a in soup.find_all("a"):
        href = a.get("href", "")
        if "/posts/detail/" in href:
            match = re.search(r"/posts/detail/(\d+)/", href)
            if match:
                post_id = int(match.group(1))
                slug = post_slug_map.get(post_id, f"p-{post_id}")
                a["href"] = f"/posts/{slug}"
    for tag in soup.find_all(True):
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr.startswith("data-cke-"):
                del tag[attr]
    return str(soup)


def get_connection():
    db_url = os.environ.get("SOURCE_DATABASE_URL")
    if db_url and POSTGRES_AVAILABLE:
        print("Connecting to PostgreSQL source...")
        return psycopg2.connect(db_url, cursor_factory=RealDictCursor)

    print("Connecting to SQLite source (fallback)...")
    db_path = "db.sqlite3"
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def extract_in_batches(conn, table_name, batch_size=1000):
    cursor = conn.cursor()
    if hasattr(cursor, "execute"):
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        total = cursor.fetchone()[0]

        for offset in range(0, total, batch_size):
            if POSTGRES_AVAILABLE and not isinstance(conn, sqlite3.Connection):
                q = "SELECT * FROM %s LIMIT %s OFFSET %s" % (
                    table_name,
                    batch_size,
                    offset,
                )
                cursor.execute(q)
            else:
                q = "SELECT * FROM %s LIMIT %s OFFSET %s" % (
                    table_name,
                    batch_size,
                    offset,
                )
                cursor.execute(q)
            yield [dict(row) for row in cursor.fetchall()]


def run_extraction():
    conn = get_connection()
    output_dir = "PlayNest/src/migration/data-temp"
    os.makedirs(output_dir, exist_ok=True)

    # 1. Build Slug Map for SEO-aware transformation
    print("Building post slug map...")
    post_slug_map = {}
    cursor = conn.cursor()
    cursor.execute("SELECT id, slug FROM posts_post")
    for row in cursor.fetchall():
        post_slug_map[row["id"]] = row["slug"]

    tables = {
        "identity": ["users_user", "posts_authorprofile"],
        "media_taxonomy": [
            "medias_media",
            "posts_category",
            "posts_tag",
            "posts_series",
        ],
        "content": [
            "posts_post",
            "posts_revision",
            "pages_page",
            "posts_posttag",
            "medias_postmedia",
        ],
        "social_nav": [
            "interactions_comment",
            "interactions_reaction",
            "navigation_menu",
            "navigation_menuitem",
        ],
    }

    for group, table_names in tables.items():
        all_data = {}
        for table in table_names:
            print(f"Extracting {table}...")
            data = []
            for batch in extract_in_batches(conn, table):
                for row in batch:
                    for field in ["content", "excerpt", "bio"]:
                        val = row.get(field)
                        if isinstance(val, str) and "<" in val and ">" in val:
                            res = transform_html_content(val, post_slug_map)
                            row[field] = res
                data.extend(batch)
            all_data[table.split("_")[-1]] = data

        name = group.replace("_", "-")
        fn = "{}.json".format(name)
        fp = os.path.join(output_dir, fn)
        with open(fp, "w") as f:
            json.dump(all_data, f, indent=2)

    conn.close()


if __name__ == "__main__":
    run_extraction()
