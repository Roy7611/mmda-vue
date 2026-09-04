const wsUrl =
  process.argv[2] ||
  "ws://127.0.0.1:9222/devtools/page/2DC832337813AD955E839F8E53195E1F";
const target = process.argv[3] || "http://127.0.0.1:5174/BASE/";
const ws = new WebSocket(wsUrl);
let id = 0;
const pending = new Map();

function send(method, params = {}) {
  const i = ++id;
  return new Promise((resolve) => {
    pending.set(i, resolve);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
}

ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  } else if (msg.method === "Runtime.consoleAPICalled") {
    const args = (msg.params.args || [])
      .map((a) => a.value ?? a.description ?? "")
      .join(" ");
    console.log("CONSOLE", msg.params.type, String(args).slice(0, 800));
  } else if (msg.method === "Runtime.exceptionThrown") {
    console.log(
      "EXCEPTION",
      String(
        msg.params.exceptionDetails?.exception?.description ||
          msg.params.exceptionDetails?.text ||
          "",
      ).slice(0, 1200),
    );
  }
};

ws.onopen = async () => {
  await send("Runtime.enable");
  await send("Page.enable");
  await send("Page.navigate", { url: target });
  await new Promise((r) => setTimeout(r, 6000));
  const expr =
    '({url:location.href,title:document.title,text:(document.body&&document.body.innerText||"").slice(0,800),appLen:(document.querySelector("#app")&&document.querySelector("#app").innerHTML||"").length,children:document.querySelector("#app")&&document.querySelector("#app").childElementCount})';
  const r = await send("Runtime.evaluate", {
    expression: expr,
    returnByValue: true,
  });
  console.log("PAGE", JSON.stringify(r.result?.result?.value ?? r, null, 2));
  ws.close();
  process.exit(0);
};

ws.onerror = (e) => {
  console.error("ws err", e);
  process.exit(1);
};

setTimeout(() => {
  console.error("timeout");
  process.exit(1);
}, 25000);
