# u--1 experiments

Some experiments in building analytics websites with these goals:

- zero loading time pre-built html files
- well structured, minimum styling, minimum JS
- simple, navigable/searchable using browser UI
- attempt some difference in the UI
- be fully live and usable websites

## 1 (sparklines)

[u--1.com](https://u--1.com)

- 250 svg price charts for the top coins, see every coin at a glance
- [script.js](https://github.com/geeogi/u--1/blob/main/sparklines/script.js) fetches data from coingecko, compresses SVGs with SVGO, produces a single index.html file that's ~40kb brotli compressed
- script.js runs every 5 minutes in a Cloudflare scheduled worker, index.html cached and served by Cloudflare
- short domain easy to type

Could run the script every 5 seconds to produce a live file, just need a coingecko api key. Would be intrigued to see what ~1000 charts would feel like also.
