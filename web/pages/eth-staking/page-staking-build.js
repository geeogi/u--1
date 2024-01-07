import * as fs from "fs";
import * as urpc from "../../utils/urpc.js";

async function main() {
  const urpcTemplate = fs.readFileSync(
    "./pages/eth-staking/page-staking-template.html",
    "utf8"
  );

  const { template, json } = await urpc.renderToString(urpcTemplate);

  let htmlContent = template;
  let jsonContent = json;

  const timestamp = Math.round(Date.now() / 1000);
  htmlContent = htmlContent.replace("{timestamp}", timestamp);

  jsonContent.lastUpdatedUnix = timestamp;
  jsonContent.citation = "u--1.com";
  jsonContent.contact = "@geeogi";
  jsonContent.page = "https://u--1.com/eth-staking";
  jsonContent.api = "https://u--1.com/eth-staking.json";
  jsonContent.title = "Ethereum staking directory";
  jsonContent.sourceCode = "https://github.com/geeogi/u--1";
  jsonContent.description = [
    "Assorted onchain values related to",
    "Ethereum staking, LST, DVT, EigenLayer, Lending and Restaking.",
    "Built by u--1 and powered by Alchemy RPC.",
    "This API is free to use.",
  ].join(" ");

  fs.writeFile("dist/eth-staking.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });

  fs.writeFile(
    "dist/eth-staking.json",
    JSON.stringify(jsonContent, null, 2),
    "utf8",
    (err) => {
      if (err) {
        console.error("An error occurred:", err);
      } else {
        console.log("JSON file written successfully");
      }
    }
  );
}

main();
