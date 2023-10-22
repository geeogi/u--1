import { EthereumRPC, LidoAPI } from "./page-staking-utils.js";

async function main() {
  const CONTRACTS = {
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    curveStETH: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
  };

  const { stETH, wstETH, curveStETH } = CONTRACTS;

  const stETHSupply = await EthereumRPC.totalSupply(stETH);
  const stETHApr = await LidoAPI.stETHApr();
  const wstETHSupply = await EthereumRPC.totalSupply(wstETH);
  const crvStETHLpStETH = await EthereumRPC.balanceOf(stETH, curveStETH);
  const crvStETHLpETH = await EthereumRPC.ethBalance(curveStETH);
  const ethPrice = await EthereumRPC.ethPrice();

  console.log("stETH", stETHSupply);
  console.log("stETH APR", stETHApr);
  console.log("wstETH", wstETHSupply);
  console.log("crv stETH balance", crvStETHLpStETH);
  console.log("crv ETH balance", crvStETHLpETH);
  console.log("ETH price", ethPrice);
}

main();
