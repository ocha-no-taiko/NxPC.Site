#!/usr/bin/env bash
# ローカルで動作確認するためのプレビューサーバーを起動する
# 使い方:  ./preview.sh [ポート番号]
#         （ポート番号省略時は 8079）

set -euo pipefail
cd "$(dirname "$0")"

PORT="${1:-8079}"
URL="http://localhost:$PORT"

echo "index.html を最新の event.json から再生成中…"
node build.js

echo ""
echo "✅ ローカルサーバーを起動します: $URL"
echo "   （Ctrl+C で終了します。ブラウザキャッシュは無効化してあるので、"
echo "     event.json やファイルを更新したら普通にリロードするだけで反映されます）"
echo ""

# サーバーが立ち上がってからブラウザを開く
( sleep 1 && open "$URL" ) &

cd src

# キャッシュを無効化した簡易サーバー（前回、ブラウザキャッシュのせいで
# 変更が反映されず調査に手間取ったため、最初から no-cache にしてある）
python3 - "$PORT" <<'PY'
import http.server
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        super().end_headers()

    def log_message(self, fmt, *args):
        print("  " + (fmt % args))

port = int(sys.argv[1])
try:
    with http.server.ThreadingHTTPServer(('0.0.0.0', port), NoCacheHandler) as httpd:
        print(f"Serving on port {port} (Ctrl+C to stop) ...")
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\n停止しました。")
PY
