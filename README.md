# fizz-env-loader

Fizz の **.env パースコア**(§7 Hub)。.env テキストを `KEY=VALUE` ペアに解析する。

規則(openaituber `server/env.ts` と同一):
- 行を trim、空行と `#` 始まりはスキップ
- 最初の `=` で key/value 分割、両側 trim
- value が同種クォート(`"…"` / `'…'`)で囲まれていれば外す(内側の `=` は保持)
- key が空ならスキップ

`process.env` への反映/上書き判定は Node 側。テキスト→ペアのパースは純粋なので
Almide に集約=単一の正本。

## native

```sh
almide build src/main.almd -o build/fizz-env-loader
printf 'FOO=bar\n# c\nAPI_KEY="sk-1"\n\n\n' | ./build/fizz-env-loader
# FOO	bar / API_KEY	sk-1
```

## wasm

```sh
almide build src/bridge.almd --target wasm -o build/env.wasm
```

`env_alloc(len)` で .env 全文を線形メモリに書く → `env_parse()`(JSON を出力バッファに
書き長さを返す)→ `env_out_ptr()` で読み取り `JSON.parse`。グルー例
[`browser/env-driver.js`](./browser/env-driver.js)。CI で wasm↔native 一致を検証。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
