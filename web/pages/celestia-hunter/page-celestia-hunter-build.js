import * as fs from "fs";

async function main() {
  const htmlContent = fs.readFileSync(
    "./pages/celestia-hunter/page-celestia-hunter-template.html",
    "utf8"
  );

  const jsContent = fs.readFileSync(
    "./pages/celestia-hunter/celestia-hunter.js",
    "utf8"
  );

  fs.writeFile("celestia-hunter.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });

  fs.writeFile("celestia-hunter.js", jsContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
}

main();
