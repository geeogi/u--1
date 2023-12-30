import * as fs from "fs";

const url =
  "https://goerli.eigenlayer.xyz/api/trpc/operator.getAllOperatorsWithMetadata,operator.getAllOperatorTVLNumStakers,native.userPodSummary,price.getPrices,native.globalPodSummary?batch=1&input=%7B%220%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%2C%221%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%2C%222%22%3A%7B%22json%22%3A%7B%22address%22%3A%22%22%7D%7D%2C%223%22%3A%7B%22json%22%3Anull%2C%22meta%22%3A%7B%22values%22%3A%5B%22undefined%22%5D%7D%7D%2C%224%22%3A%7B%22json%22%3A%7B%22staleTime%22%3A12500%2C%22refetchOnWindowFocus%22%3Afalse%7D%7D%7D";

const HTML_TEMPLATE = fs.readFileSync(
  "./pages/el-operators/page-el-operators-template.html",
  "utf8"
);

fetchElOperators().then(async (operators) => {
  const htmlContent = HTML_TEMPLATE.replace(
    "<!-- MAIN CONTENT -->",
    operators
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

  fs.writeFile("el-operators.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
});
