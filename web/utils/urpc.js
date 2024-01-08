const TAG_PREFIX = "u";
const DIRECTORY_TAG = `${TAG_PREFIX}-directory`;
const URL_TAG = `${TAG_PREFIX}-url`;
const CALL_TAG = `${TAG_PREFIX}-c`;

/*
 * Parse the urpc call string syntax: $to.$method($args)?.$decimals
 *
 * e.g. $stETH.balanceOf($unstETH).18
 */
function parseUrpcCallString(callString, lookup) {
  const to = callString.split(".")[0];
  const methodName = callString.split(".")[1].split("(")[0];
  const args = callString
    .split("(")[1]
    .split(")")[0]
    .split(",")
    .filter((arg) => arg !== "");
  const method = `${methodName}(${args.map((_) => "address")})`;
  const decimals = callString.split(")")[1].split(".")[1];

  const values = {
    to: lookup(to),
    method: lookup(method),
    args: args.map(lookup),
    decimals: lookup(decimals),
  };

  return { to, method, args, decimals, values };
}

const CACHE = {};

// Make an RPC call
async function callRPC(url, call) {
  const cacheKey = `${url}-${JSON.stringify(call)}`;

  if (CACHE[cacheKey]) {
    return CACHE[cacheKey];
  }

  const { method, args, to } = call.values;
  const data = encodeMethodCall(method, args || []);

  const payload = {
    jsonrpc: "2.0",
    id: 1,
    method: "eth_call",
    params: [{ to, data }, "latest"],
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await response.json();

  if (json.error) {
    console.error("RPC call failed:", { to, method, args });
    throw new Error(json.error.message);
  }

  CACHE[cacheKey] = json.result;

  return json.result;
}

// Encode method call data
function encodeMethodCall(method, args) {
  let data = method;
  for (let i = 0; i < args.length; i++) {
    data += padArgument(args[i]);
  }
  return data;
}

// Pad value to 32 bytes
function padArgument(arg) {
  return arg.startsWith("0x")
    ? arg.slice(2).padStart(64, "0")
    : arg.padStart(64, "0");
}

// Pretty parse return value
function getDisplayValue(value, decimals) {
  if (decimals !== undefined) {
    const num = parseInt(value, 16) / 10 ** decimals;
    return num > 9999
      ? // locale comma string for large values
        Math.round(num).toLocaleString()
      : num > 1
      ? // 2 decimal places
        Math.round(num * 100) / 100
      : // 5 decimal places
        Math.round(num * 100000) / 100000;
  } else {
    return value;
  }
}

// Generate template for RPC result
function getResultTemplate(call, result) {
  const displayValue = getDisplayValue(result, call.values.decimals);
  const arg0 = call.values.args?.[0];
  const arg1 = call.values.args?.[1];
  const arg0Name = call.args?.[0]?.replace("$", "");
  const arg1Name = call.args?.[1]?.replace("$", "");
  const toName = call.to?.replace("$", "");
  const methodName = call.method?.replace("$", "");
  const id = `dialog-${Date.now()}-${Math.random()}`;
  const onClick = `this.getRootNode().getElementById('${id}').showModal()`;
  const template = [
    `<span>${displayValue}</span>`,
    "&nbsp;",
    "&nbsp;",
    `<button onclick="${onClick}">ⓘ</button>`,
    `<dialog id="${id}">
      <p><b>contract</b>: ${toName} (${call.values.to})</p>
      <p><b>method</b>: ${methodName} (${call.values.method})</p>
      ${arg0 ? `<p><b>arg0</b>: ${arg0Name}  (${arg0})</p>` : ""}
      ${arg1 ? `<p><b>arg1</b>: ${arg1Name}  (${arg1})</p>` : ""}
      <p><b>result</b>: ${displayValue}</p>
      <form method="dialog">
        <button>close</button>
      </form>
    </dialog>`,
  ].join("");

  return { template, displayValue };
}

// SSR: render urpc HTML in server environments
export async function renderToString(html) {
  const url = html
    .split(`<${URL_TAG}`)[1]
    .split(">")[1]
    .split(`</${URL_TAG}`)[0]
    .trim();

  const vars = html
    .split(`<${DIRECTORY_TAG}`)[1]
    .split(`</${DIRECTORY_TAG}`)[0]
    .split("<var>")
    .filter((item) => item.includes("</var>"))
    .map((item) => item.split("</var>")[0]);

  const directory = new Map();

  vars.forEach((variable) => {
    const [key, value] = variable.split(":");
    directory.set(key, value);
  });

  const lookup = (v) =>
    v?.includes("$") ? directory.get(v.replace("$", ""))?.trim() : v || v;

  const calls = html
    .split(`<${CALL_TAG}`)
    .filter((item) => item.includes(`</${CALL_TAG}`))
    .map((item) => item.split(`</${CALL_TAG}`)[0]);

  const results = [];

  for (const item of calls) {
    const key = item.split('key="')[1]?.split('"')[0];
    const callString = item.split(">")[1].trim();
    const call = parseUrpcCallString(callString, lookup);
    const result = await callRPC(url, call);
    const { template, displayValue } = getResultTemplate(call, result);

    results.push({ key, call, callString, displayValue, result, template });
  }

  let template = html.slice();
  const json = { values: {} };

  // insert call results
  results.forEach((item) => {
    template = template.replace(item.callString, item.template);

    const key = item.key || item.callString;

    json.values[key] = {
      key,
      call: item.call,
      displayValue: item.displayValue,
      result: item.result,
    };
  });

  // remove url
  template =
    template.split(`<${URL_TAG}`)[0] + template.split(`</${URL_TAG}>`)[1];

  // remove directory
  template =
    template.split(`<${DIRECTORY_TAG}`)[0] +
    template.split(`</${DIRECTORY_TAG}>`)[1];

  // cleanup blank lines
  template = template
    .split("\n")
    .filter((line) => line.trim() !== "")
    .join("\n");

  return { template, json };
}
