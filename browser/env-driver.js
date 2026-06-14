// env-driver.js — .env 全文を KEY=VALUE に解析するグルー例 (パースは Almide、fs は Node)。
export async function loadEnvParser(wasmUrl) {
  const { readFile } = await import("node:fs/promises");
  const mod = await WebAssembly.compile(await readFile(new URL(wasmUrl, import.meta.url)));
  const imports = {}; for (const i of WebAssembly.Module.imports(mod)) (imports[i.module] ??= {})[i.name] = () => 0;
  const { exports: ex } = await WebAssembly.instantiate(mod, imports); try { ex._start(); } catch {}
  const enc = new TextEncoder(), dec = new TextDecoder();
  return {
    // .env 全文 → { KEY: VALUE, ... }
    parse(content) {
      const b = enc.encode(content); const p = ex.env_alloc(b.length);
      new Uint8Array(ex.memory.buffer, Number(p), b.length).set(b);
      const len = ex.env_parse(); const op = ex.env_out_ptr();
      return JSON.parse(dec.decode(new Uint8Array(ex.memory.buffer, Number(op), Number(len))));
    },
  };
}
