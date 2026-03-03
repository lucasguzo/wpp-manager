🚀 WPP-Manager
A interface visual definitiva para gerenciar suas instâncias do WPPConnect Server.

O WPP-Manager é um painel de controle moderno, desenvolvido com Next.js 14 e Prisma, projetado para facilitar o gerenciamento de múltiplas sessões do WPPConnect Server. Chega de gerenciar conexões via Postman ou Insomnia.

✨ Funcionalidades
Gerenciamento Multi-Sessão: Crie, conecte e monitore múltiplas contas de WhatsApp em um único painel.
Identificação Inteligente: Sistema de sessionId único para evitar conflitos entre instâncias.
Visualização de QR Code: Interface em tempo real para autenticação de novos dispositivos.
Status em Tempo Real: Monitoramento visual (Connected, Disconnected, Syncing).
Otimização de Performance: Opção integrada para desativar o historySync, economizando RAM do seu servidor.
Segurança: Abstração completa da SECRET_KEY do WPPConnect no Backend (Server Actions).

🛠️ Stack Tecnológica
Framework: Next.js 14 (App Router)
Estilização: Tailwind CSS + Shadcn/UI
Banco de Dados: Prisma ORM (PostgreSQL/MySQL/SQLite)
Ícones: Lucide React
Comunicação: WPPConnect Server API

🚀 Como Começar
Pré-requisitos
Ter um WPPConnect Server rodando (Local ou VPS).
Node.js 18+ instalado.

Instalação
Clone o repositório:

git clone https://github.com/seu-usuario/WPP-Manager.git
cd WPP-Manager
Instale as dependências:

npm install
Configure as variáveis de ambiente:
Crie um arquivo .env na raiz do projeto:

DATABASE_URL="file:./dev.db"
WPP_SERVER_URL="http://seu-ip:21462"
WPP_SECRET_KEY="sua_secret_key_aqui"
Prepare o banco de dados:

npx prisma migrate dev --name init
Inicie o projeto:

Bash
npm run dev
📋 Como usar
Acesse http://localhost:3000.

Clique em "Nova Conexão".
Dê um nome para sua loja ou setor (ex: Laralu_Vendas).
O sistema gerará um ID único e exibirá o QR Code.
Escaneie com seu celular e pronto! A sessão aparecerá como Connected.

🏗️ Arquitetura de Conexão
O Dashboard atua como uma camada de gerenciamento (Orquestrador):


graph LR
  A[Interface Next.js] --> B[Server Actions / API]
  B --> C[(Prisma DB)]
  B --> D[WPPConnect Server]
  D --> E[WhatsApp Web Protocol]

🤝 Contribuição
Sinta-se à vontade para abrir Issues ou enviar Pull Requests. Este projeto foi criado para ajudar a comunidade a profissionalizar o uso do WPPConnect!

📝 Licença
Distribuído sob a licença MIT. Veja LICENSE para mais informações.

Desenvolvido por Lucas com Antigravity.
