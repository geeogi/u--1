async function hunt() {
  const mainEl = document.getElementById("main");
  const footerEl = document.getElementById("footer");

  try {
    footerEl.innerText = "hunting blocks...";

    const urlParams = new URLSearchParams(window.location.search);
    const paramHeight = urlParams.get("height");
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
          const shareCommitments = firstMessage?.["share_commitments"];
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

          const txRow = document.createElement("div");
          txRow.style = "display:flex;column-gap:12px";

          const linkElement = document.createElement("a");
          linkElement.href = link;
          linkElement.style.minWidth = "95px";
          linkElement.style.display = "block";
          linkElement.textContent = hash.slice(0, 12).toLowerCase();
          txRow.appendChild(linkElement);

          const typeElement = document.createElement("div");
          typeElement.textContent = type;
          txRow.appendChild(typeElement);

          if (namespace) {
            const namespaceElement = document.createElement("div");
            namespaceElement.textContent = namespace;
            txRow.appendChild(namespaceElement);
          }

          if (amount) {
            const amountElement = document.createElement("div");
            const m = 1000000;
            const amountValue = denom === "utia" ? Number(amount) / m : amount;
            const displayAmount = Number(amountValue).toLocaleString();
            const symbol = denom.replace("utia", "tia");
            amountElement.textContent = `${displayAmount} ${symbol}`;
            txRow.appendChild(amountElement);
          }

          if (memo) {
            const memoElement = document.createElement("div");
            memoElement.title = "memo";
            memoElement.style = "word-break:break-word;max-width:70%;";
            const italicElement = document.createElement("i");
            italicElement.textContent = memo;
            memoElement.appendChild(italicElement);
            txRow.appendChild(memoElement);
          }

          if (shareCommitments?.length) {
            const onViewBlob = (commitment) => () =>
              fetch("https://api.celenium.io/v1/blob", {
                body: JSON.stringify({
                  hash: namespace,
                  height: blockHeight,
                  commitment,
                }),
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
                .then((blob) => {
                  const id = `dialog-${Date.now()}-${Math.random()}`;
                  const dialogHTML = `
                    <dialog id="${id}">
                      <p><b>namespace</b>: ${namespace}</p>
                      <p><b>height</b>: ${blockHeight}</p>
                      <p><b>commitment</b>: ${commitment}</p>
                      <p><b>blob</b></p>
                      <p
                        style="
                          max-width:500px;
                          max-height:150px;
                          overflow:auto;
                          word-break:break-word;
                        "
                      >
                        ${blob.data}
                      </p>
                      <p>
                        <i
                          >powered by
                          <a target="_blank" href="https://celenium.io"
                            >celenium.io</a
                          >
                        </i>
                      </p>
                      <form method="dialog">
                        <button>Close</button>
                      </form>
                    </dialog>
                  `;

                  document.body.insertAdjacentHTML("beforeend", dialogHTML);
                  document.getElementById(id).showModal();
                })
                .catch(() => alert("failed to fetch blob"));

            shareCommitments?.forEach((commitment, index) => {
              const blobButton = document.createElement("button");
              blobButton.innerText = `view blob ${index + 1}`;
              blobButton.onclick = onViewBlob(commitment);
              txRow.appendChild(blobButton);
            });
          }

          txEl.innerHTML = "";
          txEl.appendChild(txRow);
        });
      }
    );

    const prevBlock = selectedBlockHeight - 10;
    const nextBlock = Math.min(selectedBlockHeight + 10, latestBlockHeight);

    footerEl.innerHTML = "";

    const footerRow = document.createElement("div");
    footerRow.style.display = "flex";
    footerRow.style.columnGap = "16px";

    const prevPageLink = document.createElement("a");
    prevPageLink.href = `${location.pathname}?height=${prevBlock}`;
    prevPageLink.textContent = "prev page";
    footerRow.appendChild(prevPageLink);

    if (selectedBlockHeight < latestBlockHeight) {
      if (nextBlock < latestBlockHeight) {
        const nextPageLink = document.createElement("a");
        nextPageLink.href = `${location.pathname}?height=${nextBlock}`;
        nextPageLink.textContent = "next page";
        footerRow.appendChild(nextPageLink);
      }

      const latestPageLink = document.createElement("a");
      latestPageLink.href = `${location.pathname}`;
      latestPageLink.textContent = "latest page";
      footerRow.appendChild(latestPageLink);
    }

    footerEl.appendChild(footerRow);
  } catch (e) {
    console.error(e);
    footerEl.innerText = "error occured and dev needs to fix";
  }
}

window.onload = hunt;
