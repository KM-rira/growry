# =========================
# Stage 1: deps（依存関係インストール）
# =========================
# 軽量なNode.jsイメージ（サイズ削減）
FROM node:20-alpine AS deps

WORKDIR /app  # 作業ディレクトリ

COPY package.json package-lock.json ./
# 依存定義だけコピー（キャッシュ効かせるため）

RUN npm ci
# lockfileベースで依存インストール（再現性高い）


# =========================
# Stage 2: builder（ビルド用）
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# depsステージの依存を使い回し（高速化）

COPY . .
# ソースコードをコピー

RUN npm run build
# Next.jsをビルド（.next配下が生成される）


# =========================
# Stage 3: runner（本番実行用）
# =========================
FROM node:20-alpine AS runner

WORKDIR /app

# 本番モード
ENV NODE_ENV=production
# ポート設定
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
# 実行に必要な最小構成（node_modules含む）

COPY --from=builder /app/.next/static ./.next/static
# 静的ファイル（JS/CSS）

COPY --from=builder /app/public ./public
# publicディレクトリ

RUN mkdir -p /app/db
# SQLite用ディレクトリ（volume前提）

EXPOSE 3000
# 外部公開ポート

CMD ["node", "server.js"]
# standaloneのNext.jsサーバ起動
