import sqlite3
import json
import os
import sys
from bs4 import BeautifulSoup
import re

# Add the utils directory to path for importing html_transformer if needed,
# but for simplicity we'll keep it self-contained or import it.
# from PlayNest.src.migration.utils.html_transformer import transform_html_content

def transform_html_content(html):
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
                post_id = match.group(1)
                a["href"] = f"/posts/p-{post_id}"
    for tag in soup.find_all(True):
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr.startswith("data-cke-"):
                del tag[attr]
    return str(soup)

def get_connection(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

def extract_in_batches(conn, table_name, batch_size=1000):
    cursor = conn.cursor()
    cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
    total = cursor.fetchone()[0]

    for offset in range(0, total, batch_size):
        cursor.execute(f"SELECT * FROM {table_name} LIMIT {batch_size} OFFSET {offset}")
        yield [dict(row) for row in cursor.fetchall()]

def run_extraction():
    db_path = "db.sqlite3"
    if not os.path.exists(db_path):
        print(f"Error: {db_path} not found")
        return

    conn = get_connection(db_path)
    output_dir = "PlayNest/src/migration/data-temp"
    os.makedirs(output_dir, exist_ok=True)

    tables = {
        "identity": ["users_user", "posts_authorprofile"],
        "media_taxonomy": ["medias_media", "posts_category", "posts_tag", "posts_series"],
        "content": ["posts_post", "posts_revision", "pages_page", "posts_posttag", "medias_postmedia"],
        "social_nav": ["interactions_comment", "interactions_reaction", "navigation_menu", "navigation_menuitem"]
    }

    for group, table_names in tables.items():
        all_data = {}
        for table in table_names:
            print(f"Extracting {table}...")
            data = []
            for batch in extract_in_batches(conn, table):
                # Apply DOM-based HTML transformation during extraction if it's a content field
                for row in batch:
                    for field in ["content", "excerpt", "bio"]:
                        if field in row and row[field] and isinstance(row[field], str):
                            if "<" in row[field] and ">" in row[field]: # Heuristic for HTML
                                row[field] = transform_html_content(row[field])
                data.extend(batch)
            all_data[table.split('_')[-1]] = data

        with open(f"{output_dir}/{group.replace('_', '-')}.json", "w") as f:
            json.dump(all_data, f, indent=2)

    conn.close()

if __name__ == "__main__":
    run_extraction()
