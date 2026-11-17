# Leon Tan | Personal Website & Portfolio

My personal portfolio site, showcasing my education, experience, and projects.

**[View the live site →](https://www.itsleontan.com)**

## Built With
- HTML5 and CSS3
- Vanilla JavaScript (no frameworks)
- Python 3 (standard library only) for a small asset-fetching script
- Hosted on GitHub Pages

## Project Structure
- `/css` – stylesheets for layout and design
- `/js` – scripts for interactive UI elements
- `/scripts` – utility scripts (see below)
- `/src` – images, icons, book covers, and resume PDF

## Book Covers Script
The 'Reading' section of the site displays book covers pulled from [Open Library](https://openlibrary.org/dev/docs/api/covers). `scripts/fetch_covers.py` reads a Goodreads library export, finds every book on a "favourites" shelf, and downloads its cover by ISBN into `src/covers/`. Books that already have a cover are skipped, and blank placeholder images are rejected.

## Development
I initially designed and developed this website from scratch. As AI tools improved, I brought in Claude Opus 5.5 to co-develop it with me.

## License
Copyright © 2026 Leon Tan. All rights reserved. The code and content in this repository may not be reproduced, redistributed, or modified without written permission.

## Contact
[LinkedIn](https://www.linkedin.com/in/leon-tan-41b7a616a/) · [Email](mailto:itsleontan@gmail.com)