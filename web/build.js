import { execSync } from "child_process";

async function build() {
  execSync("rm -rf dist");
  execSync("mkdir dist");
  execSync("mkdir dist/assets");
  execSync("cp -R assets/. dist/assets");

  await import("./pages/index/page-index-build.js");
  await import("./pages/eth-staking/page-staking-build.js");
  await import("./pages/celestia-hunter/page-celestia-hunter-build.js");
}

build().catch((err) => console.error("An error occurred:", err));
