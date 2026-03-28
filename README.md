# Fast Food Manager

Este projeto é uma aplicação completa para gerenciamento de pedidos, com:

- `backend`: API Node.js + Express integrada com Supabase
- `frontend/lucas-food`: painel web React + Vite
- `frontend-mobile/mobile`: app mobile Expo + React Native

## Estrutura do repositório

- `backend/`
  - servidor Express que expõe rotas de produtos e pedidos
  - usa Supabase para autenticação e banco de dados
- `frontend/lucas-food/`
  - painel web para acessar PDV, produtos e cozinha
  - usa React, Vite e Supabase para login e dados
- `frontend-mobile/mobile/`
  - app mobile para clientes ou uso interno
  - usa Expo Router e Supabase para autenticação e pedidos

## Pré-requisitos

- Node.js 18+ e npm
- Conta e projeto no Supabase
- Emulador Android / iOS, dispositivo real ou Expo Go para rodar o mobile

## Configuração de variáveis de ambiente

### Backend

Crie um arquivo `backend/.env` com:

```env
SUPABASE_URL=seu_supabase_url
SUPABASE_ANON_KEY=sua_anon_key
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
PORT=3000
```

### Web (frontend)

Crie um arquivo `frontend/lucas-food/.env` com:

```env
VITE_SUPABASE_URL=seu_supabase_url
VITE_SUPABASE_ANON_KEY=sua_anon_key
```

### Mobile (Expo)

Crie um arquivo `frontend-mobile/mobile/.env` com:

```env
EXPO_PUBLIC_SUPABASE_URL=seu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key
```

## Instalação e execução

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

O servidor irá rodar em `http://localhost:3000` por padrão.

### 2. Frontend web

```bash
cd frontend/lucas-food
npm install
npm run dev
```

Depois, acesse a URL exibida no terminal (normalmente `http://localhost:5173`).

### 3. Mobile

```bash
cd frontend-mobile/mobile
npm install
npm run android
```

ou

```bash
npm start
```

## Observações

- O frontend web usa `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- O mobile usa `EXPO_PUBLIC_SUPABASE_URL` e `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- O backend precisa da `SUPABASE_SERVICE_ROLE_KEY` para criar pedidos e acessar dados com permissão.

## Notas rápidas

- Se quiser rodar tudo junto, abra três terminais separados: backend, web e mobile.
- Caso ocorra erro de autenticação, confira se as variáveis de ambiente estão corretas e se o projeto Supabase está ativo.

## Links úteis

- [Supabase](https://supabase.com)
- [Expo](https://expo.dev)
- [Vite](https://vitejs.dev)
