#!/bin/sh
set -e

# Dentro do compose o host do MySQL é o serviço "mysql"
export DB_HOST="${DB_HOST:-mysql}"
export DB_PORT="${DB_PORT:-3306}"

echo "[entrypoint] Aplicando migrations..."
npm run db:migrate

echo "[entrypoint] Iniciando API..."
exec npm start
