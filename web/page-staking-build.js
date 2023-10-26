import * as fs from "fs";
import {
  CoinbaseAPI,
  EigenLayerAPI,
  EthereumRPC,
  EtherscanAPI,
  LidoAPI,
  SSVAPI,
} from "./page-staking-utils.js";

async function main() {
  const CONTRACTS = {
    arbWstETHBridge: "0x0F25c1DC2a9922304f2eac71DCa9B07E310e8E5a",
    opWstETHBridge: "0x76943C0D61395d8F2edF9060e1533529cAe05dE6",
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
    cbETH: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
    rETH: "0xae78736cd615f374d3085123a210448e74fc6393",
    frxETH: "0x5e8422345238f34275888049021821e8e08caa1f",
    sfrxETH: "0xac3e018457b222d93114458476f3e3416abbe38f",
    swETH: "0xf951e335afb289353dc249e82926178eac7ded78",
    curveStETH: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
    eigenlayerStETH: "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
    eigenlayerCbETH: "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
    eigenlayerRETH: "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
    divsStETH: "0x1ce8aAfb51e79F6BDc0EF2eBd6fD34b00620f6dB",
    lybraStETH: "0xa980d4c0C2E48d305b582AA439a3575e3de06f0E",
    aaveStETH: "0x1982b2F5814301d4e9a8b0201555376e62F82428",
    unstETH: "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1",
  };

  const {
    stETH,
    wstETH,
    cbETH,
    rETH,
    frxETH,
    sfrxETH,
    swETH,
    curveStETH,
    arbWstETHBridge,
    opWstETHBridge,
    eigenlayerStETH,
    eigenlayerCbETH,
    eigenlayerRETH,
    divsStETH,
    lybraStETH,
    aaveStETH,
    unstETH,
  } = CONTRACTS;

  const ethSupply = await EtherscanAPI.ethSupply();
  const stETHSupply = await EthereumRPC.totalSupply(stETH);
  const cbETHSupply = await EthereumRPC.totalSupply(cbETH);
  const rETHSupply = await EthereumRPC.totalSupply(rETH);
  const frxETHSupply = await EthereumRPC.totalSupply(frxETH);
  const sfrxETHSupply = await EthereumRPC.totalSupply(sfrxETH);
  const swETHSupply = await EthereumRPC.totalSupply(swETH);
  const stETHOperators = await EthereumRPC.getLidoNodeOperatorsCount();
  const stETHApr = await LidoAPI.stETHApr();
  const cbETHApy = await CoinbaseAPI.cbETHApy();
  const stETHwstETHExchange = await EthereumRPC.getStETHWstETHExchangeRate();
  const wstETHSupply = await EthereumRPC.totalSupply(wstETH);
  const wstETHSupplyArb = await EthereumRPC.balanceOf(wstETH, arbWstETHBridge);
  const wstETHSupplyOp = await EthereumRPC.balanceOf(wstETH, opWstETHBridge);
  const crvStETHLpStETH = await EthereumRPC.balanceOf(stETH, curveStETH);
  const crvStETHLpETH = await EthereumRPC.ethBalance(curveStETH);
  const ethPrice = await EthereumRPC.ethPrice();
  const stETHPrice = await EthereumRPC.stETHPrice();
  const elStETHBalance = await EthereumRPC.balanceOf(stETH, eigenlayerStETH);
  const elCbETHBalance = await EthereumRPC.balanceOf(cbETH, eigenlayerCbETH);
  const elRETHBalance = await EthereumRPC.balanceOf(rETH, eigenlayerRETH);
  const elNativeBalance = await EigenLayerAPI.nativeRestaking();
  const divaStETHBalance = await EthereumRPC.balanceOf(stETH, divsStETH);
  const lybraStETHBalance = await EthereumRPC.balanceOf(stETH, lybraStETH);
  const ssvETHStaked = await SSVAPI.totalETHStaked();
  // aave v3 wstETH balance, eth, op, arb, cbETH
  const aaveStETHBalance = await EthereumRPC.balanceOf(stETH, aaveStETH);
  const unstETHBalance = await EthereumRPC.balanceOf(stETH, unstETH);

  console.log("ETH supply", ethSupply);
  console.log("stETH", stETHSupply);
  console.log("cbETH", cbETHSupply);
  console.log("rETH", rETHSupply);
  console.log("frxETH", frxETHSupply);
  console.log("sfrxETH", sfrxETHSupply);
  console.log("swETH", swETHSupply);
  console.log("stETH APR", stETHApr);
  console.log("cbETH APY", cbETHApy);
  console.log("Lido stETH operators", stETHOperators);
  console.log("stETH:wstETH", stETHwstETHExchange);
  console.log("wstETH", wstETHSupply);
  console.log("wstETH Arb", wstETHSupplyArb);
  console.log("wstETH Op", wstETHSupplyOp);
  console.log("crv stETH balance", crvStETHLpStETH);
  console.log("crv ETH balance", crvStETHLpETH);
  console.log("ETH price", ethPrice);
  console.log("stETH price", stETHPrice);
  console.log("EL stETH balance", elStETHBalance);
  console.log("EL cbETH balance", elCbETHBalance);
  console.log("EL rETH balance", elRETHBalance);
  console.log("EL native balance", elNativeBalance);
  console.log("DIVA stETH balance", divaStETHBalance);
  console.log("Lybra stETH balance", lybraStETHBalance);
  console.log("SSV ETH staked", ssvETHStaked);
  console.log("Aave stETH balance", aaveStETHBalance);
  console.log("stETH withdrawal queue", unstETHBalance);

  let htmlContext = fs.readFileSync("page-staking-template.html", "utf8");

  htmlContext = htmlContext
    .replaceAll("ethSupply", ethSupply)
    .replaceAll("stETHSupply", stETHSupply)
    .replaceAll("cbETHSupply", cbETHSupply)
    .replaceAll("rETHSupply", rETHSupply)
    .replaceAll("frxETHSupply", frxETHSupply)
    .replaceAll("sfrxETHSupply", sfrxETHSupply)
    .replaceAll("swETHSupply", swETHSupply)
    .replaceAll("stETHApr", stETHApr)
    .replaceAll("cbETHApy", cbETHApy)
    .replaceAll("stETHOperators", stETHOperators)
    .replaceAll("stETHwstETHExchange", stETHwstETHExchange)
    .replaceAll("wstETHSupply", wstETHSupply)
    .replaceAll("wstETHSupplyArb", wstETHSupplyArb)
    .replaceAll("wstETHSupplyOp", wstETHSupplyOp)
    .replaceAll("crvStETHLpSTETH", crvStETHLpStETH)
    .replaceAll("crvStETHLpETH", crvStETHLpETH)
    .replaceAll("ethPrice", ethPrice)
    .replaceAll("stETHPrice", stETHPrice)
    .replaceAll("elStETHBalance", elStETHBalance)
    .replaceAll("elCbETHBalance", elCbETHBalance)
    .replaceAll("elRETHBalance", elRETHBalance)
    .replaceAll("elNativeBalance", elNativeBalance)
    .replaceAll("divaStETHBalance", divaStETHBalance)
    .replaceAll("lybraStETHBalance", lybraStETHBalance)
    .replaceAll("ssvETHStaked", ssvETHStaked)
    .replaceAll("aaveStETHBalance", aaveStETHBalance)
    .replaceAll("unstETHBalance", unstETHBalance)
    .replaceAll("0; // TIMESTAMP", Math.round(Date.now() / 1000));

  fs.writeFile("eth-staking.html", htmlContext, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
}

main();
