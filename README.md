# BROTHER'S GAMES

E-commerce full-stack desenvolvido para venda de jogos e produtos gamer, com sistema de autenticação, carrinho, checkout, gerenciamento de pedidos, controle de estoque e painel administrativo.

## Demonstração

Site online:

https://brothers-games.brothersgames.workers.dev/

## Funcionalidades

### Cliente

- Cadastro e login de usuários
- Catálogo de produtos
- Pesquisa e filtros
- Visualização detalhada dos produtos
- Carrinho de compras
- Checkout
- Pagamento via PIX e cartão
- Cálculo de frete
- Histórico de pedidos
- Acompanhamento do status do pedido
- Cancelamento de pagamento quando permitido
- Avaliações de produtos
- Área de dados pessoais
- Tema claro e escuro

### Administração

- Painel administrativo
- Cadastro de produtos
- Edição e exclusão de produtos
- Controle de estoque
- Produtos em promoção
- Gerenciamento de pedidos
- Visualização de vendas
- Atualização do status dos pedidos
- Cancelamento e reembolso de pedidos pagos
- Gerenciamento de avaliações

## Tecnologias

- React
- JavaScript
- Vite
- HTML
- CSS
- Supabase
- PostgreSQL
- Supabase Authentication
- Supabase Edge Functions
- Mercado Pago
- Melhor Envio
- Cloudflare

## Backend

O projeto utiliza Supabase para:

- Autenticação
- Banco de dados
- Controle de usuários
- Produtos
- Pedidos
- Estoque
- Avaliações
- Edge Functions

As operações críticas do checkout e pagamento são executadas no backend para evitar manipulação direta pelo cliente.

## Pagamentos

Integração com Mercado Pago para processamento de pagamentos.

O sistema possui suporte a:

- PIX
- Cartão
- Confirmação de pagamento
- Webhook de atualização
- Cancelamento
- Reembolso

## Frete

Integração com Melhor Envio para cálculo e gerenciamento das opções de entrega.

## Controle de estoque

O sistema utiliza controle de estoque integrado ao fluxo de pedidos.

O estoque é reservado durante o processo de compra e tratado de acordo com o status do pedido, incluindo cancelamentos e reembolsos.

## Segurança

O projeto utiliza práticas como:

- Variáveis de ambiente para credenciais
- Operações sensíveis executadas no backend
- Supabase Row Level Security
- Controle de autenticação e autorização
- Validação de operações administrativas
- Proteção de dados sensíveis

Arquivos `.env` e credenciais privadas não são armazenados neste repositório.

## Estrutura do projeto

```text
brothers-games/
├── public/
├── src/
│   ├── App.jsx
│   ├── AdminPanel.jsx
│   ├── SitePopup.jsx
│   ├── data/
│   └── lib/
├── supabase/
│   └── functions/
├── index.html
├── package.json
└── vite.config.js