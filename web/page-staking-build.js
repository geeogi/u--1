import * as fs from "fs";
import {
  //CoinbaseAPI,
  //EigenLayerAPI,
  RPC,
  //EtherscanAPI,
  //LidoAPI,
  //SSVAPI,
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

  const values = [
    { key: "stETHSupply", value: RPC.totalSupply(stETH) },
    { key: "cbETHSupply", value: RPC.totalSupply(cbETH) },
    { key: "rETHSupply", value: RPC.totalSupply(rETH) },
    { key: "frxETHSupply", value: RPC.totalSupply(frxETH) },
    { key: "sfrxETHSupply", value: RPC.totalSupply(sfrxETH) },
    { key: "swETHSupply", value: RPC.totalSupply(swETH) },
    { key: "stETHOperators", value: RPC.getLidoNodeOperatorsCount() },
    { key: "stETHwstETHExchange", value: RPC.getStETHWstETHExchangeRate() },
    { key: "wstETHSupply", value: RPC.totalSupply(wstETH) },
    { key: "wstETHSupplyArb", value: RPC.balanceOf(wstETH, arbWstETHBridge) },
    { key: "wstETHSupplyOp", value: RPC.balanceOf(wstETH, opWstETHBridge) },
    { key: "crvStETHLpStETH", value: RPC.balanceOf(stETH, curveStETH) },
    { key: "crvStETHLpETH", value: RPC.ethBalance(curveStETH) },
    { key: "ethPrice", value: RPC.ethPrice() },
    { key: "stETHPrice", value: RPC.stETHPrice() },
    { key: "elStETHBalance", value: RPC.balanceOf(stETH, eigenlayerStETH) },
    { key: "elCbETHBalance", value: RPC.balanceOf(cbETH, eigenlayerCbETH) },
    { key: "elRETHBalance", value: RPC.balanceOf(rETH, eigenlayerRETH) },
    { key: "divaStETHBalance", value: RPC.balanceOf(stETH, divsStETH) },
    { key: "lybraStETHBalance", value: RPC.balanceOf(stETH, lybraStETH) },
    { key: "aaveStETHBalance", value: RPC.balanceOf(stETH, aaveStETH) },
    { key: "unstETHBalance", value: RPC.balanceOf(stETH, unstETH) },
    { key: "timestamp", value: Math.round(Date.now() / 1000) },
    // Add other balances for aave v3 (eth, op, arb, cbETH)
  ];

  await Promise.all(values.map((item) => item.value));

  console.log(values)

  values.forEach((item) => console.log(item.key, item.value));

  let htmlContent = fs.readFileSync("page-staking-template.html", "utf8");

  values.forEach((item) => {
    htmlContent = htmlContent.replaceAll(`@${item.key}@`, item.value);
  });

  fs.writeFile("eth-staking.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
}

main();
