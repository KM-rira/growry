#!/bin/bash

set -e

echo "=== Growry 本番環境へのデプロイ開始 ==="
echo ""

APP_NAME="growry"
APP_DIR="/home/ubuntu/repo/growry"
SERVICE_NAME="growry"
MY_DOMAIN_URL="${MY_DOMAIN_URL:-https://example.com}"

cd "$APP_DIR"

echo "📦 依存関係を確認中..."
bun install
echo ""

echo "🏗️  Next.js をビルド中..."
bun run build
echo ""

echo "🛑 ${SERVICE_NAME} サービスを停止中..."
sudo systemctl stop "$SERVICE_NAME"
echo ""

echo "🚀 ${SERVICE_NAME} サービスを起動中..."
sudo systemctl start "$SERVICE_NAME"
echo ""

echo "🔄 Caddy を reload 中..."
sudo systemctl reload caddy
echo ""

echo "📊 サービスステータス確認中..."
echo ""
echo "=== ${SERVICE_NAME} ==="
sudo systemctl status "$SERVICE_NAME" --no-pager
echo ""
echo "=== Caddy ==="
sudo systemctl status caddy --no-pager

echo ""
echo "✅ デプロイ完了！"
echo "🌐 アクセスURL: ${MY_DOMAIN_URL}/growry/"
echo "📝 Growry ログ確認: sudo journalctl -u ${SERVICE_NAME} -f"
echo "📝 Caddy ログ確認: sudo journalctl -u caddy -f"
