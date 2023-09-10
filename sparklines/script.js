const fs = require("fs");
const { optimize } = require("svgo");

const baseUrl = "https://api.coingecko.com/api/v3/coins/markets";
const params1 = "vs_currency=usd&order=market_cap_desc";
const params2 = "per_page=250&sparkline=false&locale=en";
const params3 = "page=1";

const USE_LOCAL_DATA = true;

async function fetchTop250() {
  if (USE_LOCAL_DATA) {
    return new Promise((resolve) => {
      fs.readFile("api.json", "utf8", (_err, data) => {
        resolve(JSON.parse(data));
      });
    });
  } else {
    const url = `${baseUrl}?${params1}&${params2}&${params3}`;
    return fetch(url).then((response) => response.json());
  }
}
const HTML_TEMPLATE = fs.readFileSync("template.html", "utf8");

fetchTop250().then(async (data) => {
  const coins = await Promise.all(
    data
      .map((item) => {
        const imageId = item.image
          ?.replace?.("https://assets.coingecko.com/coins/images/", "")
          ?.split("/")?.[0];

        return { ...item, imageId };
      })
      .filter(({ imageId }) => imageId !== undefined)
      .map(async (item) => {
        const base = "https://www.coingecko.com/coins";
        const response = await fetch(`${base}/${item.imageId}/sparkline.svg`);
        const svg = await response.text();
        const image = "<svg".concat(svg.split("<svg")?.[1]);

        const result = await optimize(image, {
          plugins: [
            // set of built-in plugins enabled by default
            "preset-default",
            // enable built-in plugins by name
            "prefixIds",
            {
              name: "cleanupNumericValues",
              params: {
                floatPrecision: 0,
              },
            },
            {
              name: "convertPathData",
              params: {
                floatPrecision: 0,
              },
            },
          ],
        });

        fs.writeFileSync(`images/${item.imageId}.svg`, result.data);

        return item;
      })
  );

  const htmlContent = HTML_TEMPLATE.replace(
    "<!-- content -->",
    coins
      .map((coin) => {
        const { symbol, imageId } = coin;
        const fontSize = symbol.length > 5 ? "0.7rem" : "0.8rem";

        const style = [
          "margin: 0",
          `font-size: ${fontSize}`,
          "border-left: solid 1px #f0f0f0",
          "border-bottom: solid 1px #f0f0f0",
        ].join(";");

        return `<figure style="${style}">
          <figcaption>${symbol.toUpperCase()}</figcaption>
          <img
            title="${symbol.toUpperCase()}"
            width="73px"
            height="25px"
            src="/images/${imageId}.svg"
            alt="${symbol.toUpperCase()}"
            loading="lazy"
          />
        </figure>`;
      })
      .join("\n")
  );

  fs.writeFile("index.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
});
