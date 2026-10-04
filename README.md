# Zaira Christa, portfolio

Plain HTML, CSS and JavaScript. No build step, nothing to install.

## Run it

1. Open this folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension (VS Code will suggest it).
3. Right-click `index.html` and choose **Open with Live Server**.

Please use Live Server rather than double-clicking `index.html`. The YouTube player
for the sun button can refuse to load from a plain file.

## Your three settings: `js/config.js`

- `SUBSTACK_URL`: your Substack address (not linked from the menu for now)
- `EMAIL`: the contact address
- `SONG_URL`: the YouTube link of the official upload the sun plays

## Where things live

- `index.html`: the pages (Home, About, Work, Contact) and the character sheet window
- `css/style.css`: the styling for Home, About, Contact and the shared window pieces. Colours and fonts are variables at the very top.
- `css/work2.css` and `js/work2.js`: the Work page (the project list and the movable windows). The projects are listed at the top of `js/work2.js`.
- `js/main.js`: the flashing letters, scroll block, sun, character sheet and page transitions
- `assets/work2/`: the Work page pictures
- `assets/images/`: put your images here, then reference them as `assets/images/name.jpg`

## Legal pages

`privacy.html`, `terms.html` and `accessibility.html` share `css/legal.css` and are linked from the
Contact footer and the cookie pop-up. If you add analytics, a form service, a new embed or any other
third-party script, update `privacy.html` (and its date) first.

## Fonts

Times New Roman and Helvetica only. Nothing is loaded from Google Fonts.

## The old Work page

The old desktop-style Work page (Finder, dock, sticky notes, CV window and the slide decks) is no longer part of
this site. It was moved, working and self-contained, into `old-work-page/`; see the README inside that folder.
