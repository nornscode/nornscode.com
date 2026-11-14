# nornscode.com

Source for [nornscode.com](https://nornscode.com), the website for [Norns](https://github.com/nornscode/norns), an open-source durable agent runtime on the BEAM.

The site is static HTML, CSS and a little JavaScript. There is no build step and no framework.

## Layout

```
index.html        Landing page
mimir/index.html  Mimir, the reference application (Slack knowledge bot)
styles.css        All styles, dark and light themes
script.js         Theme toggle and copy-to-clipboard buttons
llms.txt          Plain-text summary of the project for LLM crawlers
assets/           Logo, screenshots, Open Graph image and its source
CNAME             Custom domain for GitHub Pages
.nojekyll         Tells GitHub Pages to serve files as-is
robots.txt        Allows all crawlers
```

## Local preview

Any static file server works. From the repo root:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>. The Mimir page is at `/mimir/`.

## Deployment

The site is served by GitHub Pages from the default branch. Pushing to `main` deploys it. The `CNAME` file points the Pages site at `nornscode.com`; do not remove it.

## Editing

- **Content** lives directly in `index.html` and `mimir/index.html`. Keep `llms.txt` in sync when the project description, version, API surface or linked repos change.
- **Theme** is set on `<html data-theme>` before first paint by an inline script in each page's `<head>`, and persisted in `localStorage` under the key `norns-theme`. Colors are CSS custom properties in `styles.css`, defined once per theme.
- **Fonts** are IBM Plex Sans and Newsreader, loaded from Google Fonts.
- **Open Graph image.** `assets/og.png` is rendered from `assets/og.html`. The regeneration command is in a comment at the top of that file; it screenshots the page at 1200x630 with headless Chrome. Regenerate the PNG whenever you change the HTML.

## Related repositories

- [norns](https://github.com/nornscode/norns): the orchestrator
- [nornsctl](https://github.com/nornscode/nornsctl): CLI
- [norns-sdk-python](https://github.com/nornscode/norns-sdk-python) and [norns-sdk-elixir](https://github.com/nornscode/norns-sdk-elixir): worker and client SDKs
- [norns-mimir-agent](https://github.com/nornscode/norns-mimir-agent): the reference application

## License

The Norns runtime is MIT licensed. Site content and assets in this repository are copyright the Norns authors.
