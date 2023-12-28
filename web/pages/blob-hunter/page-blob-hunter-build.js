import * as fs from "fs";

async function main() {
  const htmlContent = fs.readFileSync(
    "./pages/blob-hunter/page-blob-hunter-template.html",
    "utf8"
  );

  const jsContent = fs.readFileSync(
    "./pages/blob-hunter/blob-hunter.js",
    "utf8"
  );

  fs.writeFile("blob-hunter.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });

  fs.writeFile("blob-hunter.js", jsContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
}

main();
