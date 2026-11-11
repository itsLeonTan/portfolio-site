/* ========== READING PAGE ==========
   Renders the favourites shelf from the Goodreads export. To update, replace
   src/goodreads_library_export.csv (and optionally run scripts/fetch_covers.py). */
(function () {
    const CSV_URL = "../src/goodreads_library_export.csv";
    const LOCAL_COVERS = "../src/covers/";
    const FAVOURITE_SHELVES = ["favourite", "favourites", "favorite", "favorites"];

    const grid = document.getElementById("book-grid");
    const status = document.getElementById("books-status");
    const updated = document.getElementById("last-updated");
    if (!grid) return;

    // RFC 4180 parser: quoted fields, "" escapes, commas/newlines in quotes, CRLF.
    function parseCSV(text) {
        const rows = [];
        let row = [], field = "", quoted = false;
        text = text.replace(/^﻿/, "");
        for (let i = 0; i < text.length; i++) {
            const c = text[i];
            if (quoted) {
                if (c === '"') {
                    if (text[i + 1] === '"') { field += '"'; i++; }
                    else quoted = false;
                } else field += c;
            } else if (c === '"') quoted = true;
            else if (c === ",") { row.push(field); field = ""; }
            else if (c === "\n" || c === "\r") {
                if (c === "\r" && text[i + 1] === "\n") i++;
                row.push(field); rows.push(row); row = []; field = "";
            } else field += c;
        }
        if (field || row.length) { row.push(field); rows.push(row); }

        const headers = (rows.shift() || []).map(function (h) { return h.trim(); });
        return rows
            .filter(function (r) { return r.some(function (v) { return v.trim(); }); })
            .map(function (r) {
                const obj = {};
                headers.forEach(function (h, i) { obj[h] = (r[i] || "").trim(); });
                return obj;
            });
    }

    // Goodreads wraps ISBNs as ="0123456789".
    function cleanISBN(value) {
        const isbn = (value || "").replace(/[^0-9Xx]/g, "").toUpperCase();
        return isbn.length === 10 || isbn.length === 13 ? isbn : "";
    }

    // "2026/08/23" -> { y, m } (null if missing or malformed)
    function parseDate(value) {
        const m = /^(\d{4})[\/-](\d{1,2})/.exec(value || "");
        if (!m || +m[2] < 1 || +m[2] > 12) return null;
        return { y: +m[1], m: +m[2], key: m[1] + m[2].padStart(2, "0") };
    }

    function formatMonth(d) {
        return new Date(Date.UTC(d.y, d.m - 1, 1)).toLocaleDateString("en-US", {
            month: "long", year: "numeric", timeZone: "UTC"
        });
    }

    const clean = function (s) { return (s || "").replace(/\s+/g, " ").trim(); };

    function toBook(r) {
        const isbn13 = cleanISBN(r["ISBN13"]);
        const isbn10 = cleanISBN(r["ISBN"]);
        return {
            // Drop the series suffix, e.g. "(The Midnight World, #1)".
            title: clean(r["Title"]).replace(/\s*\([^()]*#\d+(\.\d+)?\)\s*$/, "") || "Untitled",
            author: clean(r["Author"]),
            isbns: [isbn13, isbn10].filter(Boolean),
            read: parseDate(r["Date Read"])
        };
    }

    function isFavourite(r) {
        return (r["Bookshelves"] || "").split(",").some(function (s) {
            return FAVOURITE_SHELVES.indexOf(s.trim().toLowerCase()) !== -1;
        });
    }

    // Local copy first, then Open Library for each ISBN, then the placeholder.
    function coverSources(book) {
        if (!book.isbns.length) return [];
        const list = [LOCAL_COVERS + book.isbns[0] + ".jpg"];
        for (const isbn of book.isbns) {
            list.push("https://covers.openlibrary.org/b/isbn/" + isbn + "-L.jpg?default=false");
        }
        return list;
    }

    function renderBook(book) {
        const item = el("li", "ani");
        const card = el("button", "book");
        card.type = "button";
        card.setAttribute("aria-expanded", "false");

        const cover = el("span", "book-cover");
        const fallback = el("span", "book-fallback");
        fallback.setAttribute("aria-hidden", "true");
        fallback.append(el("span", "book-fallback-title", book.title));
        if (book.author) fallback.append(el("span", "book-fallback-author", book.author));
        cover.append(fallback);

        const sources = coverSources(book);
        if (sources.length) {
            const img = el("img");
            img.alt = "";
            img.loading = "lazy";
            img.decoding = "async";
            img.width = 400;
            img.height = 600;
            let i = 0;
            img.addEventListener("load", function () {
                // Open Library can return a tiny blank image for unknown covers.
                if (img.naturalWidth < 20) return img.dispatchEvent(new Event("error"));
                cover.classList.add("loaded");
            });
            img.addEventListener("error", function () {
                if (++i < sources.length) img.src = sources[i];
                else img.remove();
            });
            img.src = sources[0];
            cover.append(img);
        }

        const info = el("span", "book-info");
        info.append(el("span", "book-title", book.title));
        if (book.author) info.append(el("span", "book-author", book.author));
        if (book.read) {
            const date = el("span", "book-date", "Read " + formatMonth(book.read));
            info.append(date);
        }

        card.append(cover, info);
        item.append(card);
        return item;
    }

    // Tap / Enter toggles the overlay (hover covers pointer devices). One open at a time.
    grid.addEventListener("click", function (e) {
        const card = e.target.closest(".book");
        if (!card) return;
        const open = card.getAttribute("aria-expanded") !== "true";
        for (const other of grid.querySelectorAll('.book[aria-expanded="true"]')) {
            other.setAttribute("aria-expanded", "false");
        }
        card.setAttribute("aria-expanded", open);
    });
    document.addEventListener("click", function (e) {
        if (e.target.closest(".book")) return;
        for (const card of grid.querySelectorAll('.book[aria-expanded="true"]')) {
            card.setAttribute("aria-expanded", "false");
        }
    });

    fetch(CSV_URL)
        .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.text();
        })
        .then(function (text) {
            const rows = parseCSV(text);

            // Newest activity across the whole export (the CSV has no export date).
            let latest = null;
            for (const r of rows) {
                for (const d of [parseDate(r["Date Added"]), parseDate(r["Date Read"])]) {
                    if (d && (!latest || d.key > latest.key)) latest = d;
                }
            }
            if (latest && updated) {
                updated.textContent = "Last updated " + formatMonth(latest);
                updated.hidden = false;
            }

            const books = rows.filter(isFavourite).map(toBook);
            // Most recently read first; undated books last.
            books.sort(function (a, b) {
                return (b.read ? b.read.key : "").localeCompare(a.read ? a.read.key : "");
            });

            if (!books.length) {
                status.textContent = "No favourites on the shelf yet.";
                return;
            }
            for (const book of books) {
                const item = renderBook(book);
                grid.append(item);
                revealObserver.observe(item);
            }
            status.textContent = books.length + (books.length === 1 ? " book" : " books") + " on the shelf.";
            status.classList.add("visually-hidden");
        })
        .catch(function () {
            status.textContent = "Couldn't load the shelf right now. Please try again later.";
        });
})();
