async function hunt() {
  try {
    const mainEl = document.getElementById("main");
    const footerEl = document.getElementById("footer");

    const urlParams = new URLSearchParams(window.location.search);
    const paramHeight = urlParams.get("height");

    footerEl.innerText = "hunting blocks...";

    const base = "https://celestia.api.explorers.guru/api/v1";
    const exploreTx = "https://celestia.explorers.guru/transaction";
    const latestBlockResponse = await fetch(`${base}/blocks?limit=1`);
    const latestBlock = (await latestBlockResponse.json())?.data?.[0];
    const latestBlockHeight = latestBlock?.height;

    const selectedBlockHeight = Number(paramHeight || latestBlockHeight);

    footerEl.innerText = "hunting txs...";

    Array.from({ length: 10 }, (_, i) => selectedBlockHeight - i).forEach(
      async (blockHeight) => {
        const blockEl = document.createElement("div");
        blockEl.id = blockHeight;
        blockEl.style.backgroundColor = "#f0f0f0";
        blockEl.innerText = `block: ${blockHeight}`;
        mainEl.appendChild(blockEl);

        const txsResponse = await fetch(`${base}/blocks/${blockHeight}/txs`);
        const txs = await txsResponse.json();

        txs.data.forEach(async (txInfo) => {
          const txEl = document.createElement("div");
          txEl.id = txInfo.hash;
          txEl.style.backgroundColor = "#fff";
          txEl.innerText = `hash: ${txInfo.hash}`;
          blockEl.appendChild(txEl);
          const hash = txInfo.hash;
          const param = `height=${blockHeight}`;
          const txResponse = await fetch(`${base}/txs/${hash}/raw?${param}`);
          const tx = await txResponse.json();
          const link = `${exploreTx}/${hash}`;
          const numChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);

          const body = tx.tx.body;
          const messages = body.messages;
          const firstMessage = messages?.[0];
          const type = firstMessage?.["@type"]?.split?.(".")?.reverse()?.[0];
          const namespace = firstMessage?.["namespaces"]?.[0];
          const blobSizes = firstMessage?.["blob_sizes"];
          const amountObj = firstMessage?.["amount"] || firstMessage?.["token"];
          const amount = amountObj?.[0]?.amount || amountObj?.amount;
          const denom = amountObj?.[0]?.denom || amountObj?.denom;

          let memo = body.memo;

          const isLikelyBase64 =
            memo.length > 8 &&
            memo.length % 4 === 0 &&
            !memo.includes(" ") &&
            !memo.includes("celestia") &&
            !Array.from(memo).every((char) => numChars.includes(char));

          if (isLikelyBase64) {
            try {
              memo = atob(memo);
            } catch (e) {
              // do nothing
            }
          }

          const onViewBlob = () =>
            fetch("https://api.celenium.io/v1/blob", {
              body: '{"hash":"AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJBA=","height":428903,"commitment":"C6sopM14hIXHSzXII+hy5raakpCJACEbW+Z7wnHUBKw="}',
              cache: "default",
              credentials: "omit",
              headers: {
                Accept: "application/json",
                "Accept-Language": "en-GB,en;q=0.9",
                "Content-Type": "application/json",
              },
              method: "POST",
              mode: "cors",
              redirect: "follow",
              referrer: "https://celenium.io/",
              referrerPolicy: "strict-origin-when-cross-origin",
            })
              .then((blob) => blob.json())
              .then((blob) => alert(blob.data));

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
        });
      }
    );

    const prevBlock = selectedBlockHeight - 10;
    const nextBlock = Math.min(selectedBlockHeight + 10, latestBlockHeight);

    footerEl.innerHTML = [
      '<div style="display:flex;column-gap:16px;">',
      `<a href="${location.pathname}?height=${prevBlock}">prev page</a>`,
      selectedBlockHeight < latestBlockHeight
        ? nextBlock < latestBlockHeight
          ? `<a href="${location.pathname}?height=${nextBlock}">next page</a>`
          : false
        : false,
      selectedBlockHeight < latestBlockHeight
        ? `<a href="${location.pathname}">latest page</a>`
        : false,
      "</div>",
    ]
      .filter(Boolean)
      .join("");
  } catch (e) {
    footerEl.innerText = "error occurred and dev is asleep";
  }
}

window.onload = hunt;
