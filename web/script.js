const fs = require("fs");
const { optimize } = require("svgo");

const TOP_250_URL = [
  "https://api.coingecko.com/api/v3/coins/markets",
  "?",
  "vs_currency=usd&order=market_cap_desc",
  "&",
  "per_page=250&sparkline=true&locale=en",
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
      const prices = coin.sparkline_in_7d.price;
      const svgWidth = 68;
      const svgHeight = 25;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);

      const pathD = prices
        .map((price, index) => {
          const y = (svgHeight * (price - minPrice)) / (maxPrice - minPrice);
          const normalisedY = svgHeight - y;
          const normalisedX = (svgWidth * index) / (prices.length - 1);
          return `${index === 0 ? "M" : "L"}${normalisedX} ${normalisedY}`;
        })
        .join(" ");

      const filledPathD = `${pathD} L${svgWidth} ${svgHeight} L0 ${svgHeight} Z`;

      const strokeColor =
        prices[0] < prices[prices.length - 1] ? "#31ca5b" : "#ff0000";

      const svg = [
        `<svg xmlns="http://www.w3.org/2000/svg"`,
        `width="${svgWidth}" height="${svgHeight}"`,
        `viewBox="0 0 ${svgWidth} ${svgHeight}">`,
        `<path d="${filledPathD}" fill="${strokeColor}" opacity="0.2"></path>`,
        `<path fill="none" stroke="${strokeColor}"`,
        `stroke-width="1" d="${pathD}"></path></svg>`,
      ].join(" ");

      const optimized = await optimize(svg, SVGO_CONFIG);

      // SVGO seems to lose the 0.2 opacity
      const image = optimized.data.replace('opacity="0"', 'opacity="0.2"');

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
          "margin: 1px",
          `font-size: ${fontSize}`,
          //"border-left: solid 1px #f0f0f0",
          //"border-bottom: solid 1px #f0f0f0",
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
