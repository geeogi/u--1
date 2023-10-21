// Utility for Ethereum JSON-RPC calls using fetch
const EthereumRPC = {
  endpoint:
    "https://eth-mainnet.g.alchemy.com/v2/VjRG6l7jUiq9cJNzPDoLIw2lFz-pz_Ra",

  async callContractMethod(
    contractAddress,
    methodSignature,
    args = [],
    options = { decimals: 18, returnType: "int" }
  ) {
    const data = this.encodeMethodCall(methodSignature, args);

    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: contractAddress, data: data }, "latest"],
    };

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message);
    }

    if (options.returnType === "int") {
      return parseInt(result.result, 16) / 10 ** options.decimals;
    }

    throw new Error(`unexpected return type: ${options.returnType}`);
  },

  // Encode method call data for Ethereum transaction
  encodeMethodCall(methodSignature, args) {
    let data = methodSignature;
    for (let i = 0; i < args.length; i++) {
      data += this.padArgument(args[i]);
    }
    return data;
  },

  // Pad Ethereum address or value to 32 bytes
  padArgument(arg) {
    return arg.startsWith("0x")
      ? arg.slice(2).padStart(64, "0")
      : arg.padStart(64, "0");
  },
};

async function main() {
  const SIGNATURES = {
    balanceOf: "0x70a08231",
    totalSupply: "0x18160ddd",
  };

  const CONTRACTS = {
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
  };

  const stETHSupply = await EthereumRPC.callContractMethod(
    CONTRACTS.stETH,
    SIGNATURES.totalSupply
  );

  const stETHApr = (
    await (
      await fetch("https://eth-api.lido.fi/v1/protocol/steth/apr/last")
    ).json()
  ).data.apr;

  const wstETHSupply = await EthereumRPC.callContractMethod(
    CONTRACTS.wstETH,
    SIGNATURES.totalSupply
  );

  console.log("stETH", stETHSupply);
  console.log("stETH APR", stETHApr);
  console.log("wstETH", wstETHSupply);
}

main();
