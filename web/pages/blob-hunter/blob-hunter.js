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
        const blobSizes = messages?.[0]?.["blob_sizes"];
        const amountObj = messages?.[0]?.["amount"] || messages?.[0]?.["token"];
        const amount = amountObj?.[0]?.amount || amountObj?.amount;
        const denom = amountObj?.[0]?.denom || amountObj?.denom;

        let memo = body.memo;

        const isLikelyBase64 =
          !memo.includes(" ") &&
          !memo.includes("celestia") &&
          !Array.from(memo).every((char) => numChars.includes(char)) &&
          memo.length % 4 === 0 &&
          memo.length > 8;

        if (isLikelyBase64) {
          try {
            memo = atob(memo);
          } catch (e) {
            // do nothing
          }
        }

        txEl.innerHTML = [
          '<div style="display:flex;column-gap:12px">',
          `<a href="${link}" style="min-width:95px;display:block">${hash
            .slice(0, 12)
            .toLowerCase()}</a>`,
          `<div>${type}</div>`,
          namespace ? `<div>${namespace}</div>` : undefined,
          amount
            ? `<div>${Number(
                denom === "utia" ? Number(amount) / 1000000 : amount
              ).toLocaleString()} ${denom.replace("utia", "tia")}</div>`
            : undefined,
          memo ? `<div title="memo"><i>${memo}</i></div>` : undefined,
          blobSizes?.length
            ? blobSizes
                .map((_, i) =>
                  [
                    '<a target="_blank" href="',
                    "https://explorer.modular.cloud/celestia-mainnet/transactions/",
                    `${hash.toLowerCase()}/blobs/${i}`,
                    '" style="min-width:110px;display:block">',
                    '<span style="font-size:0.5rem;">',
                    `💧</span> view blob ${i + 1}`,
                    "</a>",
                  ].join("")
                )
                .join(" ")
            : [],
          "</div>",
        ]
          .filter(Boolean)
          .join("");

        footerEl.innerText = "";
      });
    });
  } catch (e) {
    footerEl.innerText = "error occurred and dev is asleep";
  }
}

window.onload = hunt;
