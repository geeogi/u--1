const fs = require("fs");

const baseUrl = "https://api.coingecko.com/api/v3/coins/markets";
const params1 = "vs_currency=usd&order=market_cap_desc";
const params2 = "per_page=250&sparkline=false&locale=en";
const params3 = "page=1";

async function fetchTop250() {
  const url = `${baseUrl}?${params1}&${params2}&${params3}`;
  return fetch(url).then((response) => response.json());
}

const HTML_TEMPLATE = fs.readFileSync("template.html", "utf8");

fetchTop250().then((data) => {
  const coins = data
    .map((item) => ({
      name: item.symbol.toUpperCase(),
      imageId: item.image
        ?.replace?.("https://assets.coingecko.com/coins/images/", "")
        ?.split("/")?.[0],
    }))
    .filter(({ imageId }) => imageId !== undefined);

  const htmlContent = HTML_TEMPLATE.replace(
    "<!-- content -->",
    coins
      .map((coin) => {
        const { name, imageId } = coin;
        const fontSize = name.length > 5 ? "0.7rem" : "0.8rem";

        const style = [
          "margin: 0",
          `font-size: ${fontSize}`,
          "border-left: solid 1px #f0f0f0",
          "border-bottom: solid 1px #f0f0f0",
        ].join(";");

        return `
          <figure style="${style}">
            <figcaption>${name}</figcaption>
            <img
              title="${name}"
              width="73px"
              height="25px"
              src="https://www.coingecko.com/coins/${imageId}/sparkline.svg"
              alt="${name}"
              loading="lazy"
            />
          </figure>
        `;
      })
      .join("\n")
  );

  fs.writeFile("output.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
});
