import * as fs from "fs";

async function main() {
  const htmlContent = fs.readFileSync(
    "./pages/memo-hunter/page-memo-hunter-template.html",
    "utf8"
  );

  const jsContent = fs.readFileSync(
    "./pages/memo-hunter/memo-hunter.js",
    "utf8"
  );

  fs.writeFile("memo-hunter.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });

  fs.writeFile("memo-hunter.js", jsContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
}

main();
