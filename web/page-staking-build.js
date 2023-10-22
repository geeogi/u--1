import { EthereumRPC, LidoAPI } from "./page-staking-utils.js";

async function main() {
  const CONTRACTS = {
    arbWstETHBridge: "0x0F25c1DC2a9922304f2eac71DCa9B07E310e8E5a",
    opWstETHBridge: "0x76943C0D61395d8F2edF9060e1533529cAe05dE6",
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    curveStETH: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
  };

  const { stETH, wstETH, curveStETH, arbWstETHBridge, opWstETHBridge } =
    CONTRACTS;

  const stETHSupply = await EthereumRPC.totalSupply(stETH);
  const stETHApr = await LidoAPI.stETHApr();
  const stETHwstETHExchange = await EthereumRPC.getStETHWstETHExchangeRate();
  const wstETHSupply = await EthereumRPC.totalSupply(wstETH);
  const wstETHSupplyArb = await EthereumRPC.balanceOf(wstETH, arbWstETHBridge);
  const wstETHSupplyOp = await EthereumRPC.balanceOf(wstETH, opWstETHBridge);
  const crvStETHLpStETH = await EthereumRPC.balanceOf(stETH, curveStETH);
  const crvStETHLpETH = await EthereumRPC.ethBalance(curveStETH);
  const ethPrice = await EthereumRPC.ethPrice();

  console.log("stETH", stETHSupply);
  console.log("stETH APR", stETHApr);
  console.log("stETH:wstETH", stETHwstETHExchange);
  console.log("wstETH", wstETHSupply);
  console.log("wstETH Arb", wstETHSupplyArb);
  console.log("wstETH Op", wstETHSupplyOp);
  console.log("crv stETH balance", crvStETHLpStETH);
  console.log("crv ETH balance", crvStETHLpETH);
  console.log("ETH price", ethPrice);
}

main();
