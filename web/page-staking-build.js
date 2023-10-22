import { EthereumRPC, LidoAPI } from "./page-staking-utils.js";

async function main() {
  const CONTRACTS = {
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
  };

  const stETHSupply = await EthereumRPC.totalSupply(CONTRACTS.stETH);
  const stETHApr = await LidoAPI.stETHApr();
  const wstETHSupply = await EthereumRPC.totalSupply(CONTRACTS.wstETH);

  console.log("stETH", stETHSupply);
  console.log("stETH APR", stETHApr);
  console.log("wstETH", wstETHSupply);
}

main();
