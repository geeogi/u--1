import * as fs from "fs";
import { RPC } from "./page-staking-utils.js";

async function main() {
  const { CONTRACTS } = RPC;

  const values = {
    // Add other balances for aave v3 (eth, op, arb, cbETH)
    aaveStETHBalance: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.aaveV2StETH),
    cbETHSupply: RPC.totalSupply(CONTRACTS.cbETH),
    crvStETHLpETH: RPC.ethBalance(CONTRACTS.curveStETH),
    crvStETHLpStETH: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.curveStETH),
    divaStETHBalance: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.divsStETH),
    elCbETHBalance: RPC.balanceOf(CONTRACTS.cbETH, CONTRACTS.eigenlayerCbETH),
    elRETHBalance: RPC.balanceOf(CONTRACTS.rETH, CONTRACTS.eigenlayerRETH),
    elStETHBalance: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.eigenlayerStETH),
    ethPrice: RPC.ethPrice(),
    frxETHSupply: RPC.totalSupply(CONTRACTS.frxETH),
    lybraStETHBalance: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.lybraStETH),
    rETHSupply: RPC.totalSupply(CONTRACTS.rETH),
    sETH2Supply: RPC.totalSupply(CONTRACTS.sETH2),
    sfrxETHSupply: RPC.totalSupply(CONTRACTS.sfrxETH),
    stETHOperators: RPC.getLidoNodeOperatorsCount(),
    stETHPrice: RPC.stETHPrice(),
    stETHSupply: RPC.totalSupply(CONTRACTS.stETH),
    stETHwstETHExchange: RPC.getStETHWstETHExchangeRate(),
    swETHSupply: RPC.totalSupply(CONTRACTS.swETH),
    unstETHBalance: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.unstETH),
    wstETHSupply: RPC.totalSupply(CONTRACTS.wstETH),
    wstETHSupplyArb: RPC.balanceOf(CONTRACTS.wstETH, CONTRACTS.arbWstETHBridge),
    wstETHSupplyOp: RPC.balanceOf(CONTRACTS.wstETH, CONTRACTS.opWstETHBridge),
  };

  await Promise.all(
    Object.keys(values).map((key) =>
      values[key].then?.((resolvedCall) => {
        values[key] = resolvedCall;
      })
    )
  );

  let htmlContent = fs.readFileSync("page-staking-template.html", "utf8");

  Object.entries(values).forEach(([key, call]) => {
    const value =
      typeof call.value === "number"
        ? call.value > 9999
          ? Math.round(call.value).toLocaleString()
          : call.value > 1
          ? Math.round(call.value * 100) / 100
          : Math.round(call.value * 100000) / 100000
        : call.value;

    const methodName = RPC.getName(call.methodSignature);
    const contractName = RPC.getName(call.contractAddress);
    const arg0 = call.args?.[0];
    const arg0Name = RPC.getName(arg0);
    const arg1 = call.args?.[1];
    const arg1Name = RPC.getName(arg1);

    htmlContent = htmlContent.replaceAll(
      `{${key}}`,
      [
        `<span title="${call.value}">${value}</span>`,
        "&nbsp;",
        `<button
          onclick="document.getElementById('dialog-${key}').showModal()"
        >
          ⓘ
        </button>`,
        `<dialog id="dialog-${key}">
          <p><b>contract</b>: ${contractName} (${call.contractAddress})</p>
          <p><b>method</b>: ${methodName} (${call.methodSignature})</p>
          ${arg0 ? `<p><b>arg0</b>: ${arg0Name}  (${arg0})</p>` : ""}
          ${arg1 ? `<p><b>arg1</b>: ${arg1Name}  (${arg1})</p>` : ""}
          <p><b>result</b>: ${value}</p>
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
