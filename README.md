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
- `assets/images/`: put your images here, then reference them as `assets/images/name.jpg`

## Legal pages

`privacy.html`, `terms.html` and `accessibility.html` share `css/legal.css` and are linked from the
Contact footer and the cookie pop-up. If you add analytics, a form service, a new embed or any other
third-party script, update `privacy.html` (and its date) first.

## Fonts

Times New Roman and Helvetica only. Nothing is loaded from Google Fonts.
