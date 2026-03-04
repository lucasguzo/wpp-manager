const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log("Checking database state...");
        // Tenta fazer uma consulta. Se a tabela não existir, ou se a estrutura estiver diferente
        // (ex: nova coluna no schema que não está no banco), isso vai gerar um erro.
        await prisma.whatsappSession.findFirst();
        console.log("Database check passed. Data exists and schema is matched.");
        process.exit(0); // Tudo certo, não precisa do db push
    } catch (error) {
        console.log("Database check failed, setup/migration needed.");
        console.error(error.message);
        process.exit(1); // Falhou, precisa rodar o db push
    }
}

main();
