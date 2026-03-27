#!/usr/bin/env bash

set -euo pipefail

# ===== validation =====
if [[ -z "${GH_USER:-}" ]]; then
  echo "Error: GH_USER is not set."
  echo "Example: export GH_USER=km-rira"
  exit 1
fi

if [[ -z "${GH_PAT:-}" ]]; then
  echo "Error: GH_PAT is not set."
  echo "Example: export GH_PAT=your_github_pat"
  exit 1
fi

if [[ "${GH_USER}" != "${GH_USER,,}" ]]; then
  echo "Error: GH_USER must be lowercase for ghcr repository names."
  echo "Current: ${GH_USER}"
  echo "Example: export GH_USER=$(printf '%s' "${GH_USER}" | tr '[:upper:]' '[:lower:]')"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker command not found."
  exit 1
fi

# ===== config =====
IMAGE_NAME="${IMAGE_NAME:-growry}"
TAG="${TAG:-latest}"
FULL_IMAGE="ghcr.io/${GH_USER}/${IMAGE_NAME}:${TAG}"

echo "=== GHCR Push Script ==="
echo "User       : ${GH_USER}"
echo "Image      : ${IMAGE_NAME}"
echo "Tag        : ${TAG}"
echo "Full Image : ${FULL_IMAGE}"
echo

# ===== login =====
echo "==> Logging in to ghcr.io"
echo "${GH_PAT}" | docker login ghcr.io -u "${GH_USER}" --password-stdin

# ===== build =====
echo "==> Building Docker image"
docker build -t "${IMAGE_NAME}" .

# ===== tag =====
echo "==> Tagging image"
docker tag "${IMAGE_NAME}" "${FULL_IMAGE}"

# ===== push =====
echo "==> Pushing image"
docker push "${FULL_IMAGE}"

echo
echo "=== Done ==="
echo "Pushed: ${FULL_IMAGE}"
