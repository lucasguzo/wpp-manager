#!/bin/sh

# Verifica se o banco de dados já está pronto e no schema atual
echo "Checking database state..."
node check-db.js

# $? armazena o status de saída do comando anterior
if [ $? -ne 0 ]; then
  echo "Applying database migrations as needed..."
  # Tenta executar o prisma localmente e no pior dos casos baixa se falhar, evitando que trave
  npx --yes prisma db push --accept-data-loss
else
  echo "Database is ready and up to date. Skipping Prisma preparation."
fi

# Inicia o servidor Node original do standalone
echo "Starting the application..."
exec node server.js
