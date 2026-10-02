# Zaira Christa, portfolio

Plain HTML, CSS and JavaScript. No build step, nothing to install.

## Run it

1. Open this folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension (VS Code will suggest it).
3. Right-click `index.html` and choose **Open with Live Server**.

Please use Live Server rather than double-clicking `index.html`. The YouTube player
for the sun button can refuse to load from a plain file.

## Your three settings: `js/config.js`

- `SUBSTACK_URL`: your real Substack address (the "psych." page sends people here)
- `EMAIL`: the contact address
- `SONG_URL`: the YouTube link of the official upload the sun plays

## Where things live

- `index.html`: all five pages (Home, About, Work, Substack, Contact) and the presentation window
- `css/style.css`: all the styling. Colours and fonts are variables at the very top.
- `js/main.js`: the flashing letters, scroll block, sun, Finder and slide transitions
- `js/main.js` > `DECKS`: the text for every presentation. Edit the slides there.
- `assets/images/`: put your images here, then reference them as `assets/images/name.jpg`

## Fonts

Times New Roman and Helvetica only, apart from the six calligraphic fonts on the flashing
hero letters (loaded from Google Fonts in the `<head>`).
