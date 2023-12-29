async function hunt() {
  const mainEl = document.getElementById("main");
  const footerEl = document.getElementById("footer");

  try {
    footerEl.innerText = "hunting blocks...";

    const urlParams = new URLSearchParams(window.location.search);
    const paramHeight = urlParams.get("height");
    const apiBase = "https://celestia.api.explorers.guru/api/v1";
    const exploreTx = "https://celestia.explorers.guru/transaction";
    const latestBlockResponse = await fetch(`${apiBase}/blocks?limit=1`);
    const latestBlock = (await latestBlockResponse.json()).data[0];
    const latestBlockHeight = latestBlock.height;
    const selectedBlockHeight = Number(paramHeight || latestBlockHeight);

    if (paramHeight) {
      const noticeEl = document.createElement("div");
      noticeEl.style.fontStyle = "italic";
      noticeEl.innerText = `from height ${selectedBlockHeight}`;
      mainEl.appendChild(noticeEl);
    }

    footerEl.innerText = "hunting txs...";

    const blockHeights = Array.from(
      { length: 10 },
      (_, i) => selectedBlockHeight - i
    );

    const blockPromises = blockHeights.flatMap(async (blockHeight) => {
      const blockEl = document.createElement("div");
      blockEl.id = blockHeight;
      const blockTitleEl = document.createElement("div");
      blockTitleEl.style.backgroundColor = "#f0f0f0";
      blockTitleEl.innerText = `${blockHeight}`;
      blockEl.appendChild(blockTitleEl);
      mainEl.appendChild(blockEl);
      const txsResponse = await fetch(`${apiBase}/blocks/${blockHeight}/txs`);
      const txs = await txsResponse.json();

      if (txs.data.length === 0) {
        blockTitleEl.innerText = `${blockHeight} (no txs)`;
      }

      return txs.data.map(async (txInfo) => {
        const txEl = document.createElement("div");
        txEl.id = txInfo.hash;
        txEl.innerText = `hash: ${txInfo.hash}`;
        blockEl.appendChild(txEl);
        const hash = txInfo.hash;
        const param = `height=${blockHeight}`;
        const txResponse = await fetch(`${apiBase}/txs/${hash}/raw?${param}`);
        const tx = await txResponse.json();

        const date = new Date(tx.tx_response.timestamp).toLocaleString();
        blockTitleEl.innerHTML = [
          '<div style="display:flex;column-gap:16px;justify-content:space-between;">',
          `<span>${blockHeight}</span>`,
          `<span style="color:#555555">${date}</span>`,
          "</div>",
        ].join("");

        const body = tx.tx.body;
        const messages = body.messages;
        const firstMessage = messages?.[0];
        const type = firstMessage?.["@type"]?.split?.(".")?.reverse()?.[0];
        const sender = firstMessage?.["sender"];
        const receiver = firstMessage?.["receiver"];
        const namespace = firstMessage?.["namespaces"]?.[0];
        const shareCommitments = firstMessage?.["share_commitments"];
        const amountObj = firstMessage?.["amount"] || firstMessage?.["token"];
        const amount = amountObj?.[0]?.amount || amountObj?.amount;
        const denom = amountObj?.[0]?.denom || amountObj?.denom;
        const numChars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(String);

        let memo = body.memo;

        const isLikelyBase64 =
          memo.length > 8 &&
          memo.length % 4 === 0 &&
          !memo.includes(" ") &&
          !memo.includes("celestia") &&
          !Array.from(memo).every((char) => numChars.includes(char));

        if (isLikelyBase64) {
          try {
            memo = window.atob(memo);
          } catch (e) {
            // do nothing
          }
        }

        const txRow = document.createElement("div");
        txRow.style = [
          "display:flex;column-gap:12px;margin-left:12px;",
          "flex-wrap:wrap;word-wrap:break-word;",
        ].join("");

        const linkElement = document.createElement("a");
        linkElement.href = `${exploreTx}/${hash}`;
        linkElement.target = "_blank";
        linkElement.style.minWidth = "95px";
        linkElement.style.display = "block";
        linkElement.textContent = hash.slice(0, 12).toLowerCase();
        txRow.appendChild(linkElement);

        const typeElement = document.createElement("div");
        typeElement.title = "transaction type";
        typeElement.textContent = type;
        txRow.appendChild(typeElement);

        if (namespace) {
          const namespaceElement = document.createElement("div");
          namespaceElement.title = "namespace";
          namespaceElement.innerHTML = `<i>${namespace}</i>`;
          txRow.appendChild(namespaceElement);
        }

        if (amount) {
          const amountElement = document.createElement("div");
          amountElement.title = "amount";
          const m = 1000000;
          const amountValue = denom === "utia" ? Number(amount) / m : amount;
          const displayAmount = Number(amountValue).toLocaleString();
          const symbol = denom.replace("utia", "tia");
          amountElement.textContent = `${displayAmount} ${symbol}`;
          txRow.appendChild(amountElement);
        }

        if (sender?.slice(0, 4) === "osmo") {
          const senderElement = document.createElement("div");
          senderElement.title = `sender: ${sender}`;
          senderElement.innerHTML = `<i>from osmosis 🧪</i>`;
          txRow.appendChild(senderElement);
        }

        if (receiver?.slice(0, 4) === "osmo") {
          const receiverElement = document.createElement("div");
          receiverElement.title = `receiver: ${receiver}`;
          receiverElement.innerHTML = `<i>→ to osmosis 🧪</i>`;
          txRow.appendChild(receiverElement);
        }

        if (memo) {
          const memoElement = document.createElement("div");
          memoElement.title = "memo";
          memoElement.style = "word-break:break-word;max-width:70%;";
          memoElement.innerHTML = `<i>${memo}</i>`;
          txRow.appendChild(memoElement);
        }

        if (shareCommitments?.length) {
          shareCommitments?.forEach((commitment, index) => {
            const blobButton = document.createElement("button");
            blobButton.innerText = `💧 view blob ${index + 1}`;
            blobButton.onclick = onViewBlob(
              namespace,
              blockHeight,
              commitment,
              blobButton
            );
            txRow.appendChild(blobButton);
          });
        }

        txEl.innerHTML = "";
        txEl.appendChild(txRow);
      });
    });

    await Promise.allSettled(blockPromises);

    const nextPage = selectedBlockHeight - 10;
    const previousPage = Math.min(selectedBlockHeight + 10, latestBlockHeight);

    const footerRow = document.createElement("div");
    footerRow.style.display = "flex";
    footerRow.style.columnGap = "16px";

    if (selectedBlockHeight < latestBlockHeight) {
      const latestPageLink = document.createElement("a");
      latestPageLink.href = `${location.pathname}`;
      latestPageLink.textContent = "show latest";
      footerRow.appendChild(latestPageLink);

      if (previousPage < latestBlockHeight) {
        const prevPageLink = document.createElement("a");
        prevPageLink.href = `${location.pathname}?height=${previousPage}`;
        prevPageLink.textContent = "previous page";
        footerRow.appendChild(prevPageLink);
      }
    }

    const nextPageLink = document.createElement("a");
    nextPageLink.href = `${location.pathname}?height=${nextPage}`;
    nextPageLink.textContent = "next page";
    footerRow.appendChild(nextPageLink);

    const explorersGuruLink = document.createElement("a");
    explorersGuruLink.href = "https://celestia.explorers.guru";
    explorersGuruLink.target = "_blank";
    explorersGuruLink.textContent = "powered by explorers.guru";
    explorersGuruLink.style.fontStyle = "italic";
    explorersGuruLink.style.color = "#444444";
    explorersGuruLink.style.marginLeft = "auto";
    footerRow.appendChild(explorersGuruLink);

    footerEl.innerHTML = "";
    footerEl.appendChild(footerRow);
  } catch (e) {
    console.error(e);
    footerEl.innerText = `error occurred and dev needs to fix: ${e?.message}`;
  }
}

const onViewBlob = (namespace, blockHeight, commitment, button) => () => {
  const prevButtonText = button.innerText;
  button.innerText = "💧 loading...";

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

      const dialogStyle = [
        "max-width:500px;",
        "max-height:150px;",
        "overflow:auto;",
        "word-break:break-word;",
      ].join("");

      const celeniumLink = [
        '<a target="_blank" href="https://celenium.io">',
        "celenium.io",
        "</a>",
      ].join("");

      const dialogHTML = `
        <dialog id="${id}">
          <p><b>namespace</b>: ${namespace}</p>
          <p><b>base64 decoded namespace</b>: ${window.atob(namespace)}</p>
          <p><b>height</b>: ${blockHeight}</p>
          <p><b>commitment</b>: ${commitment}</p>
          <p><b>blob</b></p>
          <p style="${dialogStyle}">${blob.data}</p>
          <p><i>powered by ${celeniumLink}</i></p>
          <form method="dialog">
            <button>Close</button>
          </form>
        </dialog>
      `;

      document.body.insertAdjacentHTML("beforeend", dialogHTML);
      document.getElementById(id).showModal();
    })
    .catch(() => alert("failed to fetch blob"))
    .finally(() => {
      button.innerText = prevButtonText;
    });
};

window.onload = hunt;
