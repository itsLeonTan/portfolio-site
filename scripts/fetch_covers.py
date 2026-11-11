#!/usr/bin/env python3
"""Download Open Library covers for every favourite in the Goodreads export.

Usage (from the repo root):  python3 scripts/fetch_covers.py
Covers are saved as src/covers/<ISBN>.jpg (ISBN13, else ISBN10), matching what
js/reading.js looks for first. Existing files are skipped; missing covers are
reported and the page falls back to Open Library / a placeholder.
"""
import csv
import pathlib
import re
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CSV_PATH = ROOT / "src" / "goodreads_library_export.csv"
OUT = ROOT / "src" / "covers"
SHELVES = {"favourite", "favourites", "favorite", "favorites"}


def isbn(value):
    v = re.sub(r"[^0-9Xx]", "", value or "").upper()
    return v if len(v) in (10, 13) else ""


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with open(CSV_PATH, newline="", encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    for row in rows:
        shelves = {s.strip().lower() for s in (row.get("Bookshelves") or "").split(",")}
        if not shelves & SHELVES:
            continue
        isbns = [i for i in (isbn(row.get("ISBN13")), isbn(row.get("ISBN"))) if i]
        title = (row.get("Title") or "").strip()
        if not isbns:
            print(f"no ISBN    {title}")
            continue
        dest = OUT / f"{isbns[0]}.jpg"
        if dest.exists():
            print(f"exists     {title}")
            continue
        for i in isbns:
            url = f"https://covers.openlibrary.org/b/isbn/{i}-L.jpg?default=false"
            req = urllib.request.Request(url, headers={"User-Agent": "itsleontan-cover-fetch/1.0"})
            try:
                with urllib.request.urlopen(req, timeout=30) as res:
                    data = res.read()
            except urllib.error.URLError:
                continue
            if len(data) > 1000:  # skip blank placeholder images
                dest.write_bytes(data)
                print(f"saved      {title} -> {dest.name}")
                break
        else:
            print(f"not found  {title}")


if __name__ == "__main__":
    main()
