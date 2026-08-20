
# BROTHER's GAMES — versão para VS Code

## 1. Instalar o Node.js
Baixe o Node.js LTS em:
https://nodejs.org/

Depois de instalar, reinicie o VS Code.

## 2. Abrir o projeto
No VS Code:
- Arquivo > Abrir Pasta
- selecione a pasta `brothers-games`

## 3. Instalar as dependências
Abra o terminal do VS Code e execute:

```bash
npm install
```

## 4. Rodar
Execute:

```bash
npm run dev
```

O terminal vai mostrar um endereço parecido com:
http://localhost:5173

Abra esse endereço no navegador.

## 5. Onde editar
Produtos:
`src/data/products.js`

Visual:
`src/styles.css`

Estrutura e funcionalidades:
`src/App.jsx`

Instagram:
procure por `https://www.instagram.com/souzx._.a`

## Importante
Esta versão é um frontend funcional/local.
O botão de finalizar compra é demonstrativo.

Para uma loja real, os próximos passos são:
1. Banco de dados (Supabase)
2. Login/cadastro real
3. Painel administrativo
4. Checkout real (Mercado Pago/Stripe)
5. Controle de estoque
6. Pedidos
7. Deploy
