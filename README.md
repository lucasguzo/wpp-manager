# 🚀 WPP-Manager

**A interface visual definitiva para gerenciar suas instâncias do WPPConnect Server.**

O **WPP-Manager** é um painel de controle moderno, desenvolvido com **Next.js 14** e **Prisma**, projetado para facilitar o gerenciamento de múltiplas sessões do [WPPConnect Server](https://github.com/wppconnect-team/wppconnect-server). 

> 💡 **Cansado de gerenciar conexões via Postman ou Insomnia?** O WPP-Manager oferece uma interface amigável para escalar seus atendimentos sem precisar abrir o terminal para cada nova conexão.

---

## ✨ Funcionalidades

* **Gerenciamento Multi-Sessão:** Crie, conecte e monitore múltiplas contas de WhatsApp em um único dashboard centralizado.
* **Identificação Inteligente:** Sistema de `sessionId` único gerado automaticamente para evitar conflitos entre instâncias de diferentes clientes.
* **Visualização de QR Code:** Interface nativa para leitura de QR Code sem necessidade de ferramentas externas.
* **Status em Tempo Real:** Monitoramento visual do ciclo de vida da conexão (Connected, Disconnected, QR Code, Syncing).
* **Otimização de Infraestrutura:** Opção integrada para desativar o `historySync` via UI, economizando memória RAM e processamento na sua VPS.
* **Arquitetura Segura:** Abstração da `SECRET_KEY` no servidor (Server-side), garantindo que tokens mestres nunca sejam expostos no frontend.

---

## 🛠️ Stack Tecnológica

* **Frontend/Backend:** [Next.js 14 (App Router)](https://nextjs.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
* **ORM:** [Prisma](https://www.prisma.io/) (Suporta PostgreSQL, MySQL e SQLite)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Comunicação:** [WPPConnect Server API](https://wppconnect.io/)

---

## 🚀 Como Começar

### Pré-requisitos

1.  Ter uma instância do **WPPConnect Server** rodando.
2.  Node.js 18+ instalado.
3.  Um banco de dados configurado (ou use SQLite para testes rápidos).

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/wpp-manager.git](https://github.com/seu-usuario/wpp-manager.git)
    cd wpp-manager
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto:
    ```env
    # URL do seu banco de dados
    DATABASE_URL="file:./dev.db"

    # Configurações do WPPConnect Server
    WPP_SERVER_URL="http://seu-ip:21462"
    WPP_SECRET_KEY="sua_secret_key_definida_no_server"
    ```

4.  **Sincronize o Banco de Dados:**
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Inicie o Dashboard:**
    ```bash
    npm run dev
    ```

---

## 📋 Como usar

1.  Acesse `http://localhost:3000`.
2.  No painel principal, clique em **"Nova Conexão"**.
3.  Insira o nome da sua loja ou cliente (ex: `Laralu_Store`).
4.  O **WPP-Manager** gerará o ID da sessão e exibirá o QR Code na tela.
5.  Escaneie com o celular físico e o status será atualizado automaticamente para **Connected**.

---

## 🏗️ Arquitetura

O **WPP-Manager** atua como um orquestrador entre o seu cliente final e a API bruta do WPPConnect:

```mermaid
graph TD
  User[Usuário/Admin] --> UI[WPP-Manager UI]
  UI --> Server[Next.js Server Actions]
  Server --> DB[(Prisma DB)]
  Server --> WPP[WPPConnect Server]
  WPP --> WA[WhatsApp Web Protocol]
