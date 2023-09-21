const fs = require("fs");
const { optimize } = require("svgo");

const TOP_250_URL = [
  "https://api.coingecko.com/api/v3/coins/markets",
  "?",
  "vs_currency=usd&order=market_cap_desc",
  "&",
  "per_page=250&sparkline=false&locale=en",
  "&",
  "page=1",
].join("");

const USE_LOCAL_DATA = false;

const SVGO_CONFIG = {
  plugins: [
    "preset-default",
    "prefixIds",
    {
      name: "cleanupNumericValues",
      params: { floatPrecision: 0 },
    },
    {
      name: "convertPathData",
      params: { floatPrecision: 0 },
    },
  ],
};

async function fetchTop250() {
  if (USE_LOCAL_DATA) {
    return new Promise((resolve) => {
      fs.readFile("mock-api.json", "utf8", (_err, data) => {
        resolve(JSON.parse(data));
      });
    });
  } else {
    return fetch(TOP_250_URL).then((response) => response.json());
  }
}

const HTML_TEMPLATE = fs.readFileSync("template.html", "utf8");

fetchTop250().then(async (data) => {
  const coins = await Promise.all(
    data.map(async (coin) => {
      const imageId = coin.image
        ?.replace?.("https://assets.coingecko.com/coins/images/", "")
        ?.split("/")?.[0];

      const base = "https://www.coingecko.com/coins";
      const response = await fetch(`${base}/${imageId}/sparkline.svg`);
      const text = await response.text();

      const svg = "<svg"
        .concat(text.split("<svg")?.[1])
        .replace('width="135"', 'width="68"')
        .replace('height="50"', 'height="25"');

      const optimized = await optimize(svg, SVGO_CONFIG);

      const image = optimized.data;

      if (!image) {
        console.log(text);
      }

      return { coin, image };
    })
  );

  const htmlContent = HTML_TEMPLATE.replace(
    "<!-- MAIN CONTENT -->",
    coins
      .map(({ coin, image }) => {
        const { symbol, current_price } = coin;

        const fontSize = symbol.length > 5 ? "0.75rem" : "0.8rem";

        const style = [
          "margin: 0",
          `font-size: ${fontSize}`,
          "border-left: solid 1px #f0f0f0",
          "border-bottom: solid 1px #f0f0f0",
          "min-width: 68px",
          "min-height: 40px",
        ].join(";");

        return `<figure style="${style}">
          <figcaption>
            <div>${symbol.toUpperCase()}</div>
            <div style="font-size: 0.75rem;color: #444;">${current_price}</div>
          </figcaption>
          ${image}
        </figure>`;
      })
      .join("\n")
  ).replace("0; // TIMESTAMP", Math.round(Date.now() / 1000));

  fs.writeFile("index.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
});
