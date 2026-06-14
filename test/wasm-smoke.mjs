import { readFileSync } from "node:fs";
const mod = await WebAssembly.compile(readFileSync(new URL("../build/env.wasm", import.meta.url)));
const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
const enc = new TextEncoder(), dec = new TextDecoder();
function parse(content) {
  const b = enc.encode(content); const p = ex.env_alloc(b.length);
  new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b);
  const len = ex.env_parse(); const op = ex.env_out_ptr();
  return JSON.parse(dec.decode(new Uint8Array(ex.memory.buffer, Number(op), Number(len))));
}
let ok = true; const ck = (c, m) => { if (!c) { console.error("FAIL " + m); ok = false; } };
const r = parse('FOO=bar\n# comment\n\nAPI_KEY="sk-1"\nURL=http://a?b=c');
ck(r.FOO === "bar", "FOO=bar");
ck(r.API_KEY === "sk-1", "quote strip");
ck(r.URL === "http://a?b=c", "inner =");
ck(Object.keys(r).length === 3, "comment/blank skipped");
console.log(ok ? "wasm OK — .env parse matches native" : "FAIL"); if (!ok) process.exit(1);
