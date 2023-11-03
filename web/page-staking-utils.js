export const RPC = {
  ENDPOINT:
    "https://eth-mainnet.g.alchemy.com/v2/VjRG6l7jUiq9cJNzPDoLIw2lFz-pz_Ra",

  CONTRACTS: {
    "Aave V2 stETH": "0x1982b2F5814301d4e9a8b0201555376e62F82428",
    "Aave V3 cbETH": "0x977b6fc5de62598b08c85ac8cf2b745874e8b78c",
    "Aave V3 rETH": "0xCc9EE9483f662091a1de4795249E24aC0aC2630f",
    "Aave V3 wstETH": "0x0B925eD163218f6662a35e0f0371Ac234f9E9371",
    "Arbitrum ERC20 bridge": "0x0F25c1DC2a9922304f2eac71DCa9B07E310e8E5a",
    "Chainlink ETH/USD": "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
    "Chainlink stETH/ETH": "0x86392dC19c0b719886221c78AB11eb8Cf5c52812",
    "Compound V3 WETH": "0xA17581A9E3356d9A858b789D68B4d866e593aE94",
    "Curve stETH": "0xdc24316b9ae028f1497c275eb9192a3ea0f67022",
    "Diva ETH": "0x16770d642e882e1769ce4ac8612b8bc0601506fc",
    "Diva stETH": "0x1ce8aAfb51e79F6BDc0EF2eBd6fD34b00620f6dB",
    "EigenLayer Pod Manager": "0x91E677b07F7AF907ec9a428aafA9fc14a0d3A338",
    "EigenLayer cbETH": "0x54945180dB7943c0ed0FEE7EdaB2Bd24620256bc",
    "EigenLayer rETH": "0x1BeE69b7dFFfA4E2d53C2a2Df135C388AD25dCD2",
    "EigenLayer stETH": "0x93c4b944D05dfe6df7645A86cd2206016c51564D",
    "Lido Node Registry": "0x55032650b14df07b85bF18A3a3eC8E0Af2e028d5",
    "OP ERC20 Bridge": "0x76943C0D61395d8F2edF9060e1533529cAe05dE6",
    ETHx: "0xA35b1B31Ce002FBF2058D22F30f95D405200A15b",
    Multicall: "0xeefBa1e63905eF1D7ACbA5a8513c70307C1cE441",
    ankrETH: "0xe95a203b1a91a908f9b9ce46459d101078c2c3cb",
    cbETH: "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704",
    eETH: "0x35fA164735182de50811E8e2E824cFb9B6118ac2",
    eUSD: "0x97de57eC338AB5d51557DA3434828C5DbFaDA371",
    frxETH: "0x5e8422345238f34275888049021821e8e08caa1f",
    mkUSD: "0x4591dbff62656e7859afe5e45f6f47d3669fbb28",
    r: "0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21",
    rETH: "0xae78736cd615f374d3085123a210448e74fc6393",
    rstETH: "0xD36306A5D6BFDe4F57b5159C6518D93f171fE755",
    sETH2: "0xFe2e637202056d30016725477c5da089Ab0A043A",
    sfrxETH: "0xac3e018457b222d93114458476f3e3416abbe38f",
    stETH: "0xae7ab96520de3a18e5e111b5eaab095312d7fe84",
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
    numPods: "0xa6a509be",
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
    const target = this.CONTRACTS.Multicall;
    const signature = this.SIGNATURES.getEthBalance;
    const args = [address];
    const result = await this.callContractMethod(target, signature, args);
    result.value = parseInt(result.value, 16) / 10 ** 18;
    return result;
  },

  async ethPrice() {
    const target = this.CONTRACTS["Chainlink ETH/USD"];
    const signature = this.SIGNATURES.latestAnswer;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16) / 10 ** 8;
    return result;
  },

  async stETHPrice() {
    const target = this.CONTRACTS["Chainlink stETH/ETH"];
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
    const target = this.CONTRACTS["Lido Node Registry"];
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

  async getEigenLayerNumPods() {
    const target = this.CONTRACTS["EigenLayer Pod Manager"];
    const signature = this.SIGNATURES.numPods;
    const result = await this.callContractMethod(target, signature);
    result.value = parseInt(result.value, 16);
    return result;
  },
};
