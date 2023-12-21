async function hunt() {
  try {
    const mainEl = document.getElementById("main");
    const footerEl = document.getElementById("footer");

    footerEl.innerText = "hunting blocks...";

    const base = "https://celestia.api.explorers.guru/api/v1";
    const exploreTx = "https://celestia.explorers.guru/transaction";
    const blocksResponse = await fetch(`${base}/blocks?limit=10`);
    const blocks = await blocksResponse.json();

    footerEl.innerText = "hunting txs...";

    blocks.data.forEach(async (block) => {
      const blockEl = document.createElement("div");
      blockEl.id = block.height;
      blockEl.style.backgroundColor = "#f0f0f0";
      blockEl.innerText = `block: ${block.height}`;
      mainEl.appendChild(blockEl);

      const txsResponse = await fetch(`${base}/blocks/${block.height}/txs`);
      const txs = await txsResponse.json();

      txs.data.forEach(async (txInfo) => {
        const txEl = document.createElement("div");
        txEl.id = txInfo.hash;
        txEl.style.backgroundColor = "#fff";
        txEl.innerText = `hash: ${txInfo.hash}`;
        blockEl.appendChild(txEl);
        const hash = txInfo.hash;
        const param = `height=${block.height}`;
        const txResponse = await fetch(`${base}/txs/${hash}/raw?${param}`);
        const tx = await txResponse.json();
        const link = `${exploreTx}/${hash}`;
        try {
          txEl.innerHTML = `<a href="${link}">${atob(tx.tx.body.memo)}</a>`;
        } catch (e) {
          txEl.innerHTML = `<a href="${link}">${tx.tx.body.memo}</a>`;
        }

        footerEl.innerText = "";
      });
    });
  } catch (e) {
    footerEl.innerText = "error occured and dev is asleep";
  }
}

window.onload = hunt;
