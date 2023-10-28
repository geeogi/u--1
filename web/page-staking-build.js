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
  const {
    stETH,
    wstETH,
    cbETH,
    rETH,
    frxETH,
    sfrxETH,
    swETH,
    sETH2,
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
  } = RPC.CONTRACTS;

  const values = [
    { key: "stETHSupply", call: RPC.totalSupply(stETH) },
    { key: "cbETHSupply", call: RPC.totalSupply(cbETH) },
    { key: "rETHSupply", call: RPC.totalSupply(rETH) },
    { key: "frxETHSupply", call: RPC.totalSupply(frxETH) },
    { key: "sfrxETHSupply", call: RPC.totalSupply(sfrxETH) },
    { key: "swETHSupply", call: RPC.totalSupply(swETH) },
    { key: "sETH2Supply", call: RPC.totalSupply(sETH2) },
    { key: "stETHOperators", call: RPC.getLidoNodeOperatorsCount() },
    { key: "stETHwstETHExchange", call: RPC.getStETHWstETHExchangeRate() },
    { key: "wstETHSupply", call: RPC.totalSupply(wstETH) },
    { key: "wstETHSupplyArb", call: RPC.balanceOf(wstETH, arbWstETHBridge) },
    { key: "wstETHSupplyOp", call: RPC.balanceOf(wstETH, opWstETHBridge) },
    { key: "crvStETHLpStETH", call: RPC.balanceOf(stETH, curveStETH) },
    { key: "crvStETHLpETH", call: RPC.ethBalance(curveStETH) },
    { key: "ethPrice", call: RPC.ethPrice() },
    { key: "stETHPrice", call: RPC.stETHPrice() },
    { key: "elStETHBalance", call: RPC.balanceOf(stETH, eigenlayerStETH) },
    { key: "elCbETHBalance", call: RPC.balanceOf(cbETH, eigenlayerCbETH) },
    { key: "elRETHBalance", call: RPC.balanceOf(rETH, eigenlayerRETH) },
    { key: "divaStETHBalance", call: RPC.balanceOf(stETH, divsStETH) },
    { key: "lybraStETHBalance", call: RPC.balanceOf(stETH, lybraStETH) },
    { key: "aaveStETHBalance", call: RPC.balanceOf(stETH, aaveStETH) },
    { key: "unstETHBalance", call: RPC.balanceOf(stETH, unstETH) },
    // Add other balances for aave v3 (eth, op, arb, cbETH)
  ];

  await Promise.all(
    values.map((item, index) =>
      item.call.then?.((resolvedCall) => {
        values[index].call = resolvedCall;
      })
    )
  );

  let htmlContent = fs.readFileSync("page-staking-template.html", "utf8");

  values.forEach((item) => {
    const value =
      typeof item.call.value === "number"
        ? item.call.value > 9999
          ? Math.round(item.call.value).toLocaleString()
          : item.call.value > 1
          ? Math.round(item.call.value * 100) / 100
          : Math.round(item.call.value * 100000) / 100000
        : item.call.value;

    const methodName = RPC.getName(item.call.methodSignature);
    const contractName = RPC.getName(item.call.contractAddress);
    const arg0 = item.call.args?.[0];
    const arg0Name = RPC.getName(arg0);
    const arg1 = item.call.args?.[1];
    const arg1Name = RPC.getName(arg1);

    htmlContent = htmlContent.replaceAll(
      `{${item.key}}`,
      [
        `<span
          title="${item.key}"
          onclick="document.getElementById('dialog-${item.key}').showModal()"
          >${value}</span
        >`,
        `<dialog id="dialog-${item.key}">
          <p>contract: ${contractName} (${item.call.contractAddress})</p>
          <p>method: ${methodName} (${item.call.methodSignature})</p>
          ${arg0 ? `<p>arg0: ${arg0Name}  (${arg0})</p>` : ""}
          ${arg1 ? `<p>arg1: ${arg1Name}  (${arg1})</p>` : ""}
          <p>result: ${value}</p>
          <form method="dialog">
            <button>OK</button>
          </form>
        </dialog>`,
      ].join("")
    );
  });

  htmlContent = htmlContent.replace(
    "{timestamp}",
    Math.round(Date.now() / 1000)
  );

  fs.writeFile("eth-staking.html", htmlContent, "utf8", (err) => {
    if (err) {
      console.error("An error occurred:", err);
    } else {
      console.log("HTML file written successfully");
    }
  });
}

main();
