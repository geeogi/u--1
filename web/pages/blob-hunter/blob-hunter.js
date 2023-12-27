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
        const numChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);

        const body = tx.tx.body;
        const messages = body.messages;

        const type = messages?.[0]?.["@type"]?.split?.(".")?.reverse()?.[0];
        const namespace = messages?.[0]?.["namespaces"]?.[0];
        const amount = messages?.[0]?.["amount"]?.[0]?.amount;
        const denom = messages?.[0]?.["amount"]?.[0]?.denom;

        let memo = body.memo;

        const isLikelyBase64 =
          !memo.includes(" ") &&
          !memo.includes("celestia") &&
          !Array.from(memo).every((char) => numChars.includes(char)) &&
          memo.length % 4 === 0;

        if (isLikelyBase64) {
          try {
            memo = atob(memo);
          } catch (e) {
            // do nothing
          }
        }

        txEl.innerHTML = [
          '<div style="display:grid;grid-template-columns: 1fr 1fr 1fr">',
          `<div>${type}</div>`,
          namespace ? `<div>${namespace}</div>` : "<div></div>",
          amount ? `<div>${amount} ${denom}</div>` : "<div></div>",
          memo ? `<div title="memo"><i>${memo}</i></div>` : "<div></div>",
          `<a href="${link}" style="min-width:110px;display:block">${hash
            .slice(0, 12)
            .toLowerCase()}</a>`,
          "</div>",
        ].join("");

        footerEl.innerText = "";
      });
    });
  } catch (e) {
    footerEl.innerText = "error occurred and dev is asleep";
  }
}

window.onload = hunt;
