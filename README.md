# NxPC.Live イベントWebページ

IAMAS NxPC.Lab のライブイベント用Webページのテンプレートです。
サーバー側でPHPなどが動かない静的ホスティングでも公開できるよう、**すべて静的HTML** で構成されています。
イベントごとに変わる内容はすべて **`src/event.json`** に集約されているので、
次回以降のイベントでは基本的に **event.json とアセットファイルの差し替え + ビルドコマンド1回** で更新できます。

## 更新手順(次のイベントを作るとき)

1. `src/event.json` を新しいイベントの内容に書き換える
2. `src/assets/` 内の画像・動画・Lottieファイルを差し替える(パスを event.json に合わせる)
3. デザイン(色・フォント)を変える場合も event.json の `theme` を編集するだけでOK
4. 以下のコマンドで `src/index.html` を再生成する

	```sh
	node build.js
	```

5. `src/index.html` を含めて `src/` 以下をコミット・デプロイする

`src/index.html` は event.json から自動生成される**ビルド成果物**です。手で直接編集しても、次に
`node build.js` を実行したときに上書きされて消えてしまうので、内容を変えたいときは必ず
`event.json`(内容)か `build.js`(HTML構造そのもの)を編集してください。

HTML構造や SCSS を触る必要があるのは、レイアウトそのものを変えたいときだけです
(`build.js` がHTML生成ロジックを持っています)。

## event.json の構成

```jsonc
{
    "event": {
        "title": "NxPC.Live vol.78",        // ページタイトル(ブラウザのタブ表示)
        "date": "2026.6.19",                 // 開催日
        "dayOfWeek": "Fri",                  // 曜日
        "openTime": "18:00",                 // 開始時刻
        "closeTime": "21:00",                // 終了時刻
        "venue": {
            "name": "IAMAS GALLERY 1",       // 会場名
            "address": "……",                 // PC表示用の住所(1行)
            "addressLinesSp": ["…", "…"]     // スマホ表示用の住所(配列の要素ごとに改行)
        },
        "about": ["段落1", "段落2"]           // About NxPC の本文(要素ごとに改行)
    },

    // ヘッダー上部の流れるテキストは date / dayOfWeek / openTime / closeTime / venue.name
    // から「2026.6.19(Fri)_18:00-21:00_IAMAS GALLERY 1」の形式で自動生成されます

    "live": {
        "url": "https://www.youtube.com/@nxpclab",  // 配信URL(空文字にするとアイコン非表示)
        "start": "2026-06-19 18:00:00",             // この時刻から
        "end": "2026-06-19 21:00:00"                //   この時刻までYouTubeアイコンを表示
    },

    "theme": {
        "colors": {
            "background": "#0A0A0A",    // ページ背景色
            "text": "#FFFFFF",          // 基本テキスト色
            "accent": "#0000FF"         // アクセント色(コンテンツ背景・ヘッダー帯など)
        },
        "fonts": {
            "stylesheets": ["…"],                       // 読み込むWebフォントのURL(Google Fonts / Adobe Fonts)
            "body": "'Noto Sans', sans-serif",          // 本文フォント
            "heading": "'redaction-50', sans-serif",    // 見出し・帯・Scrollフォント
            "performerTitle": "'noto-sans', sans-serif" // 出演チーム名のフォント
        }
    },

    "assets": {
        "videos": {
            "pcFirst": "…",    // PC用背景動画(ファーストビュー)
            "pcSecond": "…",   // PC用背景動画(スクロール後にクロスフェード)
            "sp": "…"          // スマホ用背景動画
        },
        "logos": {
            "pc": "…",         // PC用ロゴのLottieアニメーション
            "sp": "…"          // スマホ用ロゴのLottieアニメーション
        },
        "timetable": "…",      // タイムテーブル画像(空文字にするとセクションごと非表示)
        "youtubeIcon": "…"     // 配信中に表示するYouTubeアイコン画像
    },

    "credits": ["visual design: …", "web: …"],  // フッター(要素ごとに改行)

    "performers": [
        {
            "teamName": "チーム名",
            "description": "紹介文(<br>で改行できます)",
            "tags": ["Live Coding", "Audio Visual"],   // タグ(チーム名の下にチップ表示。不要なら [] )
            "images": [
                "./assets/images/performer1.png"       // 1〜3枚。枚数に応じてレイアウトが自動で変わります
            ]
        }
    ]
}
```

### 出演チームについて

- `images` は **1〜3枚** に対応。1枚=中央、2枚=左右、3枚=左中右の段違いレイアウトに自動で切り替わります(4枚以上入れても先頭3枚のみ使われます)
- `description` にはHTMLがそのまま入るので `<br>` で改行できます
- `tags` は任意。空配列 `[]` ならタグ欄自体が表示されません

## 開発環境

このサイトは完全に静的なHTML/CSS/JSです。サーバー側でPHPなどを動かす必要はありません。

- **`build.js`**: `src/event.json` を読み込んで `src/index.html` を生成する、Node標準機能のみで書かれたビルドスクリプト
- **`scss/style.scss`**: CSSのソース。テーマの色・フォントは CSS変数(`--color-accent` など)経由で
  event.json から `<style>` タグに注入されるため、**色やフォントを変えるだけなら SCSS の再ビルドは不要**です

event.json を編集したら:

```sh
node build.js
```

SCSS(レイアウトそのもの)を変更した場合は、上記に加えて:

```sh
npx sass scss/style.scss src/style.css --style=compressed --no-source-map
# または gulp (gulpfile.js) で `node build.js` 相当も含めてまとめて実行可能
```

ローカル確認(静的ファイルサーバーで十分です):

```sh
python3 -m http.server 8079 --directory src
```

## 配信中アイコンの表示について

配信中だけ表示されるYouTubeアイコンは、以前はサーバー側(PHP)で現在時刻を判定していましたが、
静的サイト化に伴い `src/main.js` が閲覧者のブラウザで `event.json` の `live.start`/`live.end`
(日本時間として解釈)と現在時刻を比較して表示を切り替えます。

## デプロイ

main ブランチへの push で GitHub Actions(`.github/workflows/deploy.yaml`)が
`node build.js` で `index.html` を再生成したうえで、`src/` 以下をサーバーへ rsync します。
デプロイ先パス(`NxPC78`)は回ごとに workflows 内の指定を変更してください。
