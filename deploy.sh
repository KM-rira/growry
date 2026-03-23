#!/bin/bash
set -e

if [ -z "$SSH_KEY_PATH" ]; then
  echo "❌ SSH_KEY_PATH が未設定です"
  exit 1
fi

if [ -z "$TARGET_INSTANCE" ]; then
  echo "❌ TARGET_INSTANCE が未設定です"
  exit 1
fi

if [ -z "$TARGET_DIR" ]; then
  echo "❌ TARGET_DIR が未設定です"
  exit 1
fi

SSH_KEY_PATH="${SSH_KEY_PATH/#\~/$HOME}"

echo "=== growry deploy start ==="
echo "TARGET_INSTANCE=$TARGET_INSTANCE"
echo "TARGET_DIR=$TARGET_DIR"

bun run build

ssh -i "$SSH_KEY_PATH" "$TARGET_INSTANCE" "mkdir -p $TARGET_DIR/.next/static $TARGET_DIR/public"

rsync -avz --delete \
  --exclude='db/' \
  --exclude='*.sqlite' \
  --exclude='*.db' \
  -e "ssh -i $SSH_KEY_PATH" \
  .next/standalone/ "$TARGET_INSTANCE:$TARGET_DIR/"

rsync -avz --delete -e "ssh -i $SSH_KEY_PATH" \
  .next/static/ "$TARGET_INSTANCE:$TARGET_DIR/.next/static/"

if [ -d public ]; then
  rsync -avz --delete -e "ssh -i $SSH_KEY_PATH" \
    public/ "$TARGET_INSTANCE:$TARGET_DIR/public/"
fi

ssh -i "$SSH_KEY_PATH" "$TARGET_INSTANCE" \
  "sudo systemctl restart growry && sudo systemctl status growry --no-pager"

echo "✅ deploy done"
