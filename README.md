# u--1 experiments

This repo contains some experiments in building analytics websites. The ambition is to build analytics websites that feel solid and reliable, like wikipedia or google. I'd also like to keep the tech really simple, using vanilla JS + HTML mostly, and also try some UIs that show information in a different way than usual. Basic goals:

- zero loading time pre-cached html files
- well structured, no styling, minimum JS
- simple, navigable/searchable using browser UI
- attempt some difference in the UI

## 1 (sparklines)

[u--1.com](https://u--1.com)

- 250 svg price charts for the top coins, see every coin at a glance
- script.js fetches data from coingecko, compresses SVGs with SVGO, produces a single index.html file that's ~40kb brotli compressed
- script.js runs every 5 minutes in Cloudflare worker, index.html cached and served by Cloudflare
- u--1 is always available and loads instantly, short domain easy to type

Could run the script every 5 seconds to produce a live file, just need a coingecko api key. Would be intrigued to see what ~1000 charts would feel like also.
