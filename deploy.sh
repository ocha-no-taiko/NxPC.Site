#!/usr/bin/env bash
# event.json などの変更をビルド・コミット・公開する
# 使い方:  ./deploy.sh "コミットメッセージ"
#         （メッセージ省略時は "Update event.json"）

set -euo pipefail
cd "$(dirname "$0")"

# event.json から src/index.html を再生成
echo "index.html を再生成中…"
node build.js

# 変更をすべてステージ
git add -A

# 変更があればコミット（無ければスキップ）
if git diff --cached --quiet; then
  echo "コミットする変更はありません。"
else
  msg="${*:-Update event.json}"
  git commit -m "$msg"
fi

# push 前にリモートの変更（GitHub上での編集など）を取り込む
echo "リモートの変更を確認中…"
if ! git pull --rebase origin main; then
  echo ""
  echo "⚠️  リモートの変更と競合しました（同じ箇所を両方で編集した等）。"
  echo "    自動では解決できないので、この画面の内容を Claude に伝えてください。"
  echo "    （元に戻したい場合は: git rebase --abort）"
  exit 1
fi

# 公開
git push

echo ""
echo "✅ 公開しました。GitHub Actions のビルドが終わると数十秒〜1分で反映されます:"
echo "   https://ocha-no-taiko.github.io/NxPC.Site/"
