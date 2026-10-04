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

- `index.html`: the pages (Home, About, Work, Contact) and the presentation window
- `css/style.css`: all the styling. Colours and fonts are variables at the very top.
- `js/main.js`: the flashing letters, scroll block, sun, Finder and slide transitions
- `js/main.js` > `DECKS`: the text for every presentation. Edit the slides there.
- `assets/CV_Zaira_Final_CREATIVE_v29.pdf`: drop the real CV here (exact filename) and the CV window on the
  Work page shows it in a PDF viewer. Until it exists, the window shows a placeholder page.
- Slide pictures: each presentation page in `DECKS` (js/main.js) can take `img:[{src:"assets/images/x.jpg", cap:"caption"}]`.
  The picture on the slide scrolls to show every image in the list. Pages without `img` show placeholder tiles.
  The Websites deck (`pan:true`) shows one tall image that scrolls by itself until the visitor takes over.
- `assets/images/`: put your images here, then reference them as `assets/images/name.jpg`

## Legal pages

`privacy.html`, `terms.html` and `accessibility.html` share `css/legal.css` and are linked from the
Contact footer and the cookie pop-up. If you add analytics, a form service, a new embed or any other
third-party script, update `privacy.html` (and its date) first.

## Fonts

Times New Roman and Helvetica only. Nothing is loaded from Google Fonts.

## Decks (work/)

Three slide decks live as pages: `work/research/`, `work/web/`, `work/fashion/`.
They read the copy from `content/*.json`; edit the words there, not in the code.

- `css/deck-theme.css`: colour, type, sizes, spacing and motion, all as variables. Change the look here.
- `css/deck.css`: the layout for each slide type, the phone layout and the print rules.
- `js/deck/`: the engine (`model.js` running order, `render.js` one layout per slide type, `stage.js` keys, swipe, progress, links).
- Deep links: `/work/research/#<project>-<n>` is slide `n` of that project. `#cover`, `#work`, `#<project>` (title card), `#closing`.
- Keys: arrows, space, Home and End to move; `N` speaker notes; `F` full screen.
- Pictures: set `image.status` to `have` and put the file at `image.src` (from the site root). Until then a marked placeholder shows the brief.
- On your machine (Live Server) slides marked `needs-input` show a yellow "To be supplied" tag and speaker notes work.
  On the live site the tags are hidden and notes are off. Add `?dev=0` locally to preview the live view.
- Save as PDF: open a deck, print (Cmd P), destination "Save as PDF", margins none, background graphics on. One slide per page.
