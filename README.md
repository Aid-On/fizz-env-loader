# fizz-env-loader

Fizz の **.env パースコア**(§7 Hub)。.env テキストを `KEY=VALUE` ペアに解析する。

規則(openaituber `server/env.ts` と同一):
- 行を trim、空行と `#` 始まりはスキップ
- 最初の `=` で key/value 分割、両側 trim
- value が同種クォート(`"…"` / `'…'`)で囲まれていれば外す(内側の `=` は保持)
- key が空ならスキップ

`process.env` への反映/上書き判定は Node 側。テキスト→ペアのパースは純粋なので
Almide に集約=単一の正本。

## API

| 関数 | 説明 |
|---|---|
| `parse_line(raw) -> Option[(String, String)]` | 1 行 → (key, value)(コメント/空行/不正は none) |
| `parse(content) -> List[(String, String)]` | .env 全文 → ペアのリスト |
| `to_json(content) -> String` | .env 全文 → `{"KEY":"VALUE",...}` |

## native

```sh
almide build src/main.almd -o build/fizz-env-loader
printf 'FOO=bar\n# c\nAPI_KEY="sk-1"\n\n\n' | ./build/fizz-env-loader
# FOO	bar / API_KEY	sk-1
```

## 注記: wasm bridge は現状省略

ブラウザは .env を扱わない(サーバ専用ユーティリティ)ため native のみを提供する。
wasm bridge は、`trim`/`slice` 由来の部分文字列を `Option[(String,String)]` 経由で
返す経路が wasm の参照カウント(rc_dec)で落ちる既知の問題(#690 と同族のエイリアス
RC)に当たるため、解消されるまで省略。Node からは native バイナリで利用できる。

ツールチェーン: [almide](https://github.com/almide/almide) v0.27.6+。依存なし。
