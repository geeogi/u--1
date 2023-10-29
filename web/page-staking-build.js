import * as fs from "fs";
import { RPC } from "./page-staking-utils.js";

async function main() {
  const { CONTRACTS } = RPC;

  const values = {
    // Add other balances for aave v3 (eth, op, arb, cbETH)
    aaveV2StETHBalance: {
      call: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS["Aave V2 stETH"]),
      description: "Balance of stETH in Aave V2",
    },
    aaveV3WstETHBalance: {
      call: RPC.balanceOf(CONTRACTS.wstETH, CONTRACTS["Aave V3 wstETH"]),
      description: "Balance of wstETH in Aave V3",
    },
    aaveV3CbETHBalance: {
      call: RPC.balanceOf(CONTRACTS.cbETH, CONTRACTS["Aave V3 cbETH"]),
      description: "Balance of cbETH in Aave V3",
    },
    aaveV3RETHBalance: {
      call: RPC.balanceOf(CONTRACTS.rETH, CONTRACTS["Aave V3 rETH"]),
      description: "Balance of rETH in Aave V3",
    },
    cbETHSupply: {
      call: RPC.totalSupply(CONTRACTS.cbETH),
      description: "Total supply of cbETH",
    },
    compoundV3CbETH: {
      call: RPC.balanceOf(CONTRACTS.cbETH, CONTRACTS["Compound V3 WETH"]),
      description: "Balance of cbETH in the Compound 3 WETH market",
    },
    compoundV3WstETH: {
      call: RPC.balanceOf(CONTRACTS.wstETH, CONTRACTS["Compound V3 WETH"]),
      description: "Balance of wstETH in the Compound 3 WETH market",
    },
    crvStETHLpETH: {
      call: RPC.ethBalance(CONTRACTS["Curve stETH"]),
      description: "Balance of ETH in Curve stETH/ETH",
    },
    crvStETHLpStETH: {
      call: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS["Curve stETH"]),
      description: "Balance of stETH in Curve stETH/ETH",
    },
    divaStETHBalance: {
      call: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS["Diva stETH"]),
      description: "Balance of stETH staked in Diva (DVTVL)",
    },
    divaETHBalance: {
      call: RPC.totalSupply(CONTRACTS["Diva ETH"]),
      description: "Balance of ETH staked in Diva (DSTVL)",
    },
    elCbETHBalance: {
      call: RPC.balanceOf(CONTRACTS.cbETH, CONTRACTS["EigenLayer cbETH"]),
      description: "Balance of cbETH in Eigenlayer",
    },
    elNumPods: {
      call: RPC.getEigenLayerNumPods(),
      description: "Number of EigenPods deployed for native restaking",
    },
    elRETHBalance: {
      call: RPC.balanceOf(CONTRACTS.rETH, CONTRACTS["EigenLayer rETH"]),
      description: "Balance of rETH in Eigenlayer",
    },
    elStETHBalance: {
      call: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS["EigenLayer stETH"]),
      description: "Balance of stETH in Eigenlayer",
    },
    ethPrice: {
      call: RPC.ethPrice(),
      description: "Current price of ETH",
    },
    frxETHSupply: {
      call: RPC.totalSupply(CONTRACTS.frxETH),
      description: "Total supply of Frax Ether (frxETH)",
    },
    lybraStETHBalance: {
      call: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS["Lybra stETH"]),
      description: "Balance of stETH in Lybra",
    },
    rETHSupply: {
      call: RPC.totalSupply(CONTRACTS.rETH),
      description: "Total supply of Rocket Pool ETH (rETH)",
    },
    sETH2Supply: {
      call: RPC.totalSupply(CONTRACTS.sETH2),
      description: "Total supply of Stakewise sETH2",
    },
    sfrxETHSupply: {
      call: RPC.totalSupply(CONTRACTS.sfrxETH),
      description: "Total supply of staked Frax Ether (sfrxETH)",
    },
    stETHBufferedEther: {
      call: RPC.getLidoBufferedEther(),
      description:
        "ETH in the stETH buffer to be deposited in the beacon chain or withdrawn",
    },
    stETHOperators: {
      call: RPC.getLidoNodeOperatorsCount(),
      description: "Number of node operators in the Lido stETH protocol",
    },
    stETHPrice: {
      call: RPC.stETHPrice(),
      description: "Current price of stETH/ETH",
    },
    stETHSupply: {
      call: RPC.totalSupply(CONTRACTS.stETH),
      description: "Total supply of Lido stETH",
    },
    stETHwstETHExchange: {
      call: RPC.getStETHWstETHExchangeRate(),
      description: "Exchange rate between stETH and wstETH",
    },
    swETHSupply: {
      call: RPC.totalSupply(CONTRACTS.swETH),
      description: "Total supply of Swell swETH",
    },
    unstETHBalance: {
      call: RPC.balanceOf(CONTRACTS.stETH, CONTRACTS.unstETH),
      description: "stETH waiting in the Lido withdrawal queue",
    },
    wstETHSupply: {
      call: RPC.totalSupply(CONTRACTS.wstETH),
      description: "Total supply of Lido wstETH",
    },
    wstETHSupplyArb: {
      call: RPC.balanceOf(CONTRACTS.wstETH, CONTRACTS["Arbitrum ERC20 bridge"]),
      description: "Balance of wstETH in the Arbitrum ERC-20 bridge",
    },
    wstETHSupplyOp: {
      call: RPC.balanceOf(CONTRACTS.wstETH, CONTRACTS["OP ERC20 Bridge"]),
      description: "Balance of wstETH in the Optimism wstETH bridge",
    },
  };

  await Promise.all(
    Object.keys(values).map((key) =>
      values[key].call.then?.((result) => {
        values[key].result = result;
      })
    )
  );

  let htmlContent = fs.readFileSync("page-staking-template.html", "utf8");

  Object.entries(values).forEach(([key, { description, result }]) => {
    const value =
      typeof result.value === "number"
        ? result.value > 9999
          ? Math.round(result.value).toLocaleString()
          : result.value > 1
          ? Math.round(result.value * 100) / 100
          : Math.round(result.value * 100000) / 100000
        : result.value;

    const methodName = RPC.getName(result.methodSignature);
    const contractName = RPC.getName(result.contractAddress);
    const arg0 = result.args?.[0];
    const arg0Name = RPC.getName(arg0);
    const arg1 = result.args?.[1];
    const arg1Name = RPC.getName(arg1);

    htmlContent = htmlContent.replaceAll(
      `{${key}}`,
      [
        `<span title="${result.value}">${value}</span>`,
        "&nbsp;",
        `<button
          onclick="document.getElementById('dialog-${key}').showModal()"
        >
          ⓘ
        </button>`,
        `<dialog id="dialog-${key}">
          <p><b>description</b>: ${description}</p>
          <p><b>contract</b>: ${contractName} (${result.contractAddress})</p>
          <p><b>method</b>: ${methodName} (${result.methodSignature})</p>
          ${arg0 ? `<p><b>arg0</b>: ${arg0Name}  (${arg0})</p>` : ""}
          ${arg1 ? `<p><b>arg1</b>: ${arg1Name}  (${arg1})</p>` : ""}
          <p><b>result</b>: ${value}</p>
          <form method="dialog">
            <button>close</button>
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
