# Task Manager - Frontend Angular

Frontend desenvolvido em Angular para o sistema de gestão de tarefas.

## 🚀 Tecnologias

- **Angular 17** - Framework frontend
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa
- **Angular Router** - Roteamento
- **Angular Forms** - Formulários reativos

## 📋 Pré-requisitos

- Node.js 18+ e npm
- Angular CLI 17+

## 🔧 Instalação

1. **Instalar dependências:**

```bash
npm install
```

2. **Instalar Angular CLI globalmente (se ainda não tiver):**

```bash
npm install -g @angular/cli
```

## 🏃 Executar a aplicação

```bash
npm start
```

Ou:

```bash
ng serve
```

A aplicação estará disponível em `http://localhost:4200`

## 🧪 Executar testes

```bash
npm test
```

Os testes estão organizados na pasta `src/tests/` e utilizam Karma e Jasmine. A configuração permite executar os testes em modo watch ou uma única vez.

## 📚 Estrutura do Projeto

```
frontend/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── task-list/
│   │   │   ├── task-form/
│   │   │   └── task-delete/
│   │   ├── core/
│   │   │   ├── classes/
│   │   │   │   └── theme-colors.class.ts
│   │   │   ├── constants/
│   │   │   │   └── storage-keys.constant.ts
│   │   │   ├── enums/
│   │   │   │   ├── http-status.enum.ts
│   │   │   │   ├── theme-mode.enum.ts
│   │   │   │   └── validation-rules.enum.ts
│   │   │   ├── services/
│   │   │   │   ├── messages.service.ts
│   │   │   │   └── theme.service.ts
│   │   │   └── utils/
│   │   │       └── debounce.util.ts
│   │   ├── guards/
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/
│   │   │   └── jwt.interceptor.ts
│   │   ├── models/
│   │   │   ├── task.model.ts
│   │   │   └── user.model.ts
│   │   ├── services/
│   │   │   ├── api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   └── task.service.ts
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.css
│   │   └── app.module.ts
│   ├── tests/
│   │   ├── components/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── task-list/
│   │   │   ├── task-form/
│   │   │   └── task-delete/
│   │   ├── core/
│   │   │   └── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── environments/
│   │   └── environment.ts
│   ├── styles.css
│   ├── index.html
│   └── main.ts
├── angular.json
├── karma.conf.js
├── package.json
├── tsconfig.json
└── tsconfig.spec.json
```

## 🎯 Funcionalidades

- ✅ Login/Registo de utilizadores
- ✅ Listagem de tarefas do utilizador autenticado
- ✅ Criação de novas tarefas
- ✅ Edição de tarefas existentes
- ✅ Eliminação de tarefas
- ✅ Marcar tarefas como concluídas/não concluídas
- ✅ Proteção de rotas (apenas utilizadores autenticados)
- ✅ Interface moderna e responsiva
- ✅ Suporte a temas claro/escuro
- ✅ Testes unitários abrangentes

## 🔒 Segurança

- **Autenticação JWT**: Tokens armazenados no localStorage
- **Guards de Rota**: Proteção de rotas privadas
- **Interceptors HTTP**: Adição automática do token JWT nas requisições
- **Validação de Formulários**: Validação client-side com Angular Forms

## 🌐 Integração com Backend

O frontend está configurado para comunicar com o backend em `http://localhost:5000/api`.

Certifique-se de que:
1. O backend está em execução
2. O CORS está configurado no backend para aceitar requisições de `http://localhost:4200`

## 📝 Notas

- As credenciais são armazenadas no localStorage
- O token JWT é adicionado automaticamente em todas as requisições autenticadas
- As rotas privadas redirecionam para `/login` se o utilizador não estiver autenticado
- Os testes estão organizados na pasta `src/tests/` seguindo a mesma estrutura de `src/app/`
- O serviço de mensagens centraliza todas as mensagens da aplicação em português (pt-PT)
- O tema do utilizador é persistido no localStorage

