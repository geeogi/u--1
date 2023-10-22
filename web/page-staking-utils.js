export const EthereumRPC = {
  ENDPOINT:
    "https://eth-mainnet.g.alchemy.com/v2/VjRG6l7jUiq9cJNzPDoLIw2lFz-pz_Ra",

  SIGNATURES: {
    balanceOf: "0x70a08231",
    totalSupply: "0x18160ddd",
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

  async callContractMethod(contractAddress, methodSignature, args = []) {
    const data = this.encodeMethodCall(methodSignature, args);

    const payload = {
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to: contractAddress, data: data }, "latest"],
    };

    const response = await fetch(this.ENDPOINT, {
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

    return result.result;
  },

  async balanceOf(tokenAddress, address, decimals = 18) {
    const args = [address];
    const signature = this.SIGNATURES.balanceOf;
    const result = await this.callContractMethod(tokenAddress, signature, args);
    return parseInt(result, 16) / 10 ** decimals;
  },

  async totalSupply(tokenAddress, decimals = 18) {
    const signature = this.SIGNATURES.totalSupply;
    const result = await this.callContractMethod(tokenAddress, signature);
    return parseInt(result, 16) / 10 ** decimals;
  },
};

export const LidoAPI = {
  async stETHApr() {
    const endpoint = "https://eth-api.lido.fi/v1/protocol/steth/apr/last";
    const response = await fetch(endpoint);
    const json = await response.json();
    return json.data.apr;
  },
};