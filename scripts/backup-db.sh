#!/usr/bin/env bash
# [OPS] Kịch bản sao lưu cơ sở dữ liệu · tài liệu mục 4.9 và 8.6
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Lỗi: Biến môi trường DATABASE_URL chưa được thiết lập." >&2
  exit 1
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="backups"
BACKUP_FILE="${BACKUP_DIR}/pbl_backup_${TIMESTAMP}.sql"

mkdir -p "${BACKUP_DIR}"

echo "Đang sao lưu cơ sở dữ liệu vào ${BACKUP_FILE}..."
pg_dump "${DATABASE_URL}" --clean --if-exists --no-owner --no-privileges > "${BACKUP_FILE}"
echo "Sao lưu hoàn tất: ${BACKUP_FILE}"
