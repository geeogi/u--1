export const RPC = {
  ENDPOINT:
    "https://eth-mainnet.g.alchemy.com/v2/VjRG6l7jUiq9cJNzPDoLIw2lFz-pz_Ra",

  CONTRACTS: {
    aaveV2StETH: "0x1982b2F5814301d4e9a8b0201555376e62F82428",
    arbWstETHBridge: "0x0F25c1DC2a9922304f2eac71DCa9B07E310e8E5a",
    cbETH: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
    curveStETH: "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
    divsStETH: "0x1ce8aAfb51e79F6BDc0EF2eBd6fD34b00620f6dB",
    eigenlayerCbETH: "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
    eigenlayerRETH: "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
    eigenlayerStETH: "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
    ethMulticall: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    ethUsdChainlink: "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    frxETH: "0x5e8422345238f34275888049021821e8e08caa1f",
    lidoNodeOperatorsRegistry: "0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5",
    lybraStETH: "0xa980d4c0C2E48d305b582AA439a3575e3de06f0E",
    opWstETHBridge: "0x76943C0D61395d8F2edF9060e1533529cAe05dE6",
    rETH: "0xae78736cd615f374d3085123a210448e74fc6393",
    sETH2: "0xFe2e637202056d30016725477c5da089Ab0A043A",
    sfrxETH: "0xac3e018457b222d93114458476f3e3416abbe38f",
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
    stETHETHChainlink: "0x86392dC19c0b719886221c78AB11eb8Cf5c52812",
    swETH: "0xf951e335afb289353dc249e82926178eac7ded78",
    unstETH: "0x889edC2eDab5f40e902b864aD4d7AdE8E412F9B1",
    wstETH: "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",
  },

  // first 8 characters of keccak_256 of e.g. balanceOf(address)
  // https://emn178.github.io/online-tools/keccak_256.html
  SIGNATURES: {
    balanceOf: "0x70a08231",
    totalSupply: "0x18160ddd",
    getEthBalance: "0x4d2301cc",
    latestAnswer: "0x50d25bcd",
    stEthPerToken: "0x035faf82",
    getNodeOperatorsCount: "0xa70c70e4",
    getBufferedEther: "0x47b714e0",
  },

  getName(hex) {
    return (
      Object.keys(this.CONTRACTS).find((key) => this.CONTRACTS[key] === hex) ||
      Object.keys(this.SIGNATURES).find((key) => this.SIGNATURES[key] === hex)
    );
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

    const json = await response.json();

    if (json.error) {
      throw new Error(json.error.message);
    }

    const value = json.result;

    return { value, contractAddress, methodSignature, args };
  },

  async balanceOf(tokenAddress, address, decimals = 18) {
    const args = [address];
    const signature = this.SIGNATURES.balanceOf;
    const result = await this.callContractMethod(tokenAddress, signature, args);
    result.value = parseInt(result.value, 16) / 10 ** decimals;
    return result;
  },

  async totalSupply(tokenAddress, decimals = 18) {
    const signature = this.SIGNATURES.totalSupply;
    const result = await this.callContractMethod(tokenAddress, signature);
    result.value = parseInt(result.value, 16) / 10 ** decimals;
    return result;
  },

  async ethBalance(address) {
    const target = this.CONTRACTS.ethMulticall;
    const signature = this.SIGNATURES.getEthBalance;
    const args = [address];
    const result = await this.callContractMethod(target, signature, args);
    result.value = parseInt(result.value, 16) / 10 ** 18;
    return result;
  },

  async ethPrice() {
    const target = this.CONTRACTS.ethUsdChainlink;
    const signature = this.SIGNATURES.latestAnswer;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16) / 10 ** 8;
    return result;
  },

  async stETHPrice() {
    const target = this.CONTRACTS.stETHETHChainlink;
    const signature = this.SIGNATURES.latestAnswer;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16) / 10 ** 18;
    return result;
  },

  async getStETHWstETHExchangeRate() {
    const target = this.CONTRACTS.wstETH;
    const signature = this.SIGNATURES.stEthPerToken;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16) / 10 ** 18;
    return result;
  },

  async getLidoNodeOperatorsCount() {
    const target = this.CONTRACTS.lidoNodeOperatorsRegistry;
    const signature = this.SIGNATURES.getNodeOperatorsCount;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16);
    return result;
  },

  async getLidoBufferedEther() {
    const target = this.CONTRACTS.stETH;
    const signature = this.SIGNATURES.getBufferedEther;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16) / 10 ** 18;
    return result;
  },
};
