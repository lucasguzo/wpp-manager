#!/bin/sh

# Aplica as migrações (se o banco não existir, ele vai criar e aplicar, se já existir, ele só ajusta pra versão mais nova)
echo "Applying database migrations..."
npx prisma db push

# Inicia o servidor Node original do standalone
echo "Starting the application..."
exec node server.js
