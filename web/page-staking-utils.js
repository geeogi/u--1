export const EthereumRPC = {
  ENDPOINT:
    "https://eth-mainnet.g.alchemy.com/v2/VjRG6l7jUiq9cJNzPDoLIw2lFz-pz_Ra",

  SIGNATURES: {
    balanceOf: "0x70a08231",
    totalSupply: "0x18160ddd",
    getEthBalance: "0x4d2301cc",
    latestAnswer: "0x50d25bcd",
    stEthPerToken: "0x035faf82",
    getNodeOperatorsCount: "0xa70c70e4",
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

  async ethBalance(address) {
    const multicall = "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441";
    const signature = this.SIGNATURES.getEthBalance;
    const args = [address];
    const result = await this.callContractMethod(multicall, signature, args);
    return parseInt(result, 16) / 10 ** 18;
  },

  async ethPrice() {
    // chainlink ETH/USD
    const chainlink = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
    const signature = this.SIGNATURES.latestAnswer;
    const result = await this.callContractMethod(chainlink, signature, []);
    return parseInt(result, 16) / 10 ** 8;
  },

  async stETHPrice() {
    // chainlink stETH/ETH
    const chainlink = "0x86392dC19c0b719886221c78AB11eb8Cf5c52812";
    const signature = this.SIGNATURES.latestAnswer;
    const result = await this.callContractMethod(chainlink, signature, []);
    return parseInt(result, 16) / 10 ** 18;
  },

  async getStETHWstETHExchangeRate() {
    const wstETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
    const signature = this.SIGNATURES.stEthPerToken;
    const result = await this.callContractMethod(wstETH, signature, []);
    return parseInt(result, 16) / 10 ** 18;
  },

  async getLidoNodeOperatorsCount() {
    const lidoCuratedStaking = "0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5";
    const signature = this.SIGNATURES.getNodeOperatorsCount;
    const result = await this.callContractMethod(lidoCuratedStaking, signature);
    return parseInt(result, 16);
  },
};

export const CoinbaseAPI = {
  async cbETHApy() {
    const endpoint = "https://api.exchange.coinbase.com/wrapped-assets/cbeth";
    const response = await fetch(endpoint);
    const json = await response.json();
    return Number(json.apy) * 100;
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

export const SSVAPI = {
  async totalETHStaked() {
    const endpoint = "https://api.ssv.network/api/v4/mainnet/validators/";
    const response = await fetch(endpoint);
    const json = await response.json();
    return Number(json.pagination.total) * 32;
  },
};
