import re

from bs4 import BeautifulSoup


def transform_html_content(html):
    if not html:
        return html

    soup = BeautifulSoup(html, "html.parser")

    # 1. Embedded media nodes (img tags)
    for img in soup.find_all("img"):
        src = img.get("src", "")
        if "/media/uploads/" in src:
            # Replace with new storage path
            img["src"] = src.replace("/media/uploads/", "/storage/media/")

        # Cleanup inline styles and attributes if necessary
        if img.has_attr("style"):
            # Basic cleanup, can be more aggressive
            pass

    # 2. Internal Links
    for a in soup.find_all("a"):
        href = a.get("href", "")
        # Example: /posts/detail/123/ -> /posts/slug-of-123
        if "/posts/detail/" in href:
            match = re.search(r"/posts/detail/(\d+)/", href)
            if match:
                post_id = match.group(1)
                # In a real migration, we'd lookup the slug.
                # For now, deterministic id-based slug.
                a["href"] = f"/posts/p-{post_id}"

    # 3. Attributes Cleanup
    # Optionally remove data attributes or non-standard CKEditor artifacts
    for tag in soup.find_all(True):
        # Example: remove 'data-cke-...' attributes
        attrs = dict(tag.attrs)
        for attr in attrs:
            if attr.startswith("data-cke-"):
                del tag[attr]

    # Return as string (BeautifulSoup handles malformed HTML)
    return str(soup)


if __name__ == "__main__":
    sample_html = (
        '<p>Check this <img src="/media/uploads/test.png" '
        'data-cke-saved-src="..."> and <a href="/posts/detail/42/">'
        "this link</a></p>"
    )
    print(transform_html_content(sample_html))
