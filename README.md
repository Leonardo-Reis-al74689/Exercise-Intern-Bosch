Task Manager - Full-Stack Application

> Sistema completo de gestão de tarefas com backend Flask, frontend Angular.

[![Backend](https://img.shields.io/badge/Backend-Flask-blue)](backend/)
[![Frontend](https://img.shields.io/badge/Frontend-Angular_17-red)](frontend/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL-blue)](docs/DEPLOY.md)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](docs/DOCKER.md)
[![Deploy](https://img.shields.io/badge/Deploy-Free-green)](docs/DEPLOY.md)

---

## Funcionalidades

### ✅ Gestão de Tarefas
- ➕ Criar tarefas com título e descrição
- 📝 Editar tarefas existentes
- ✔️ Marcar tarefas como concluídas
- 🗑️ Eliminar tarefas
- 🔍 Filtrar por estado (Pendente/Em Progresso/Concluída)

### 🔐 Autenticação e Segurança
- 👤 Registo de utilizadores
- 🔑 Login com JWT
- 🔒 Tokens com expiração automática
- 🛡️ Proteção contra CSRF, XSS, Clickjacking
- 🚦 Rate limiting (proteção contra abuso)
- 🔐 Hash de passwords com Bcrypt

### 🎨 Interface Moderna
- 🌓 Modo claro/escuro
- 📱 Design responsivo (mobile-first)
- ⚡ Single Page Application (SPA)
- 🎯 UX intuitiva
- ⌨️ Validação em tempo real

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────┐
│         FRONTEND (Angular 17)       │
│  - Components & Services            │
│  - JWT Interceptor                  │
│  - Theme Service                    │
│  - Routing & Guards                 │
└──────────────┬──────────────────────┘
               │ HTTPS/SSL
               │ JSON API
               ▼
┌─────────────────────────────────────┐
│       BACKEND (Flask + Python)      │
│  - REST API                         │
│  - JWT Authentication               │
│  - Service Layer                    │
│  - Security Middleware              │
└──────────────┬──────────────────────┘
               │ SQLAlchemy ORM
               │ SSL/TLS
               ▼
┌─────────────────────────────────────┐
│      DATABASE (PostgreSQL 15)       │
│  - Users & Tasks                    │
│  - Indexes & Constraints            │
│  - Automatic Backups                │
└─────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Opção 1: Docker 

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/FullStack-Task-Manager.git
cd FullStack-Task-Manager

# Configurar ambiente
cp docker/env.docker.example docker/.env

# Iniciar todos os serviços
docker-compose -f docker/docker-compose.yml up

# Aceder:
# Frontend: http://localhost:4200
# Backend:  http://localhost:5000
# PostgreSQL: localhost:5432
```

📖 **Guia completo:** [docs/DOCKER.md](docs/DOCKER.md)

---

### Opção 2: Instalação Local

#### Backend

```bash
cd backend

# Criar ambiente virtual
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows

# Instalar dependências
pip install -r requirements.txt

# Configurar .env
cp env.example .env
# Editar .env com as suas configurações

# Inicializar BD
python scripts/init_db.py --seed

# Executar
python main.py
```

#### Frontend

```bash
cd frontend

# Instalar dependências
npm install --legacy-peer-deps

# Executar
npm start
```

📖 **Documentação completa:**
- [Backend README](backend/README.md)
- [Frontend README](frontend/README.md)

---

## 🛠️ Stack Tecnológica

### Backend
- **Framework:** Flask 3.0
- **ORM:** SQLAlchemy 3.1
- **Autenticação:** Flask-JWT-Extended
- **Validação:** Pydantic 2.10
- **Servidor:** Gunicorn (produção)
- **Base de Dados:** PostgreSQL 15
- **Segurança:** Flask-Limiter, CORS, Security Headers

### Frontend
- **Framework:** Angular 17
- **Linguagem:** TypeScript 5.2
- **HTTP Client:** RxJS
- **Routing:** Angular Router
- **Formulários:** Reactive Forms
- **Testes:** Jasmine + Karma

### DevOps
- **Containerização:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Deploy:** Render + Vercel
- **Monitorização:** Render Native + Scripts customizados

---

## 📁 Estrutura do Projeto

```
FullStack-Task-Manager/
│
├── 📂 backend/                    # Backend Flask
│   ├── app/                       # Código da aplicação
│   │   ├── models/                # Modelos SQLAlchemy
│   │   ├── routes/                # Endpoints API
│   │   ├── services/              # Lógica de negócio
│   │   ├── schemas/               # Validação Pydantic
│   │   ├── middleware/            # Segurança e rate limiting
│   │   └── utils/                 # Utilitários
│   ├── scripts/                   # Scripts de manutenção
│   │   ├── init_db.py             # Inicializar BD
│   │   ├── keep_alive.py          # Evitar cold start
│   │   └── monitor_usage.py       # Monitorizar recursos
│   ├── tests/                     # Testes automatizados
│   ├── Dockerfile                 # Container Docker
│   ├── requirements.txt           # Dependências Python
│   └── gunicorn.conf.py           # Config servidor produção
│
├── 📂 frontend/                   # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/        # Componentes UI
│   │   │   ├── services/          # Serviços Angular
│   │   │   ├── guards/            # Route guards
│   │   │   ├── interceptors/      # HTTP interceptors
│   │   │   └── models/            # Interfaces TypeScript
│   │   └── environments/          # Configurações por ambiente
│   ├── Dockerfile                 # Container Docker
│   ├── nginx.conf                 # Config servidor web
│   └── vercel.json                # Config deploy Vercel
│
├── 📂 docker/                     # Docker Compose
│   ├── docker-compose.yml         # Desenvolvimento local
│   └── docker-compose.prod.yml    # Referência produção
│
├── 📂 .github/workflows/          # CI/CD
│   ├── backend-tests.yml          # Testes backend
│   ├── frontend-tests.yml         # Testes frontend
│   └── keep-alive.yml             # Manter serviço ativo
│
├── 📂 docs/                       # Documentação
│   ├── DEPLOY.md                  # Guia de deploy
│   ├── DOCKER.md                  # Guia Docker
│   ├── TROUBLESHOOTING.md         # Resolução de problemas
│   └── MONITORING.md              # Monitorização
│
└── README.md                      # Este ficheiro
```

---

## 🧪 Testes

### Backend (Pytest)

```bash
cd backend
pytest --cov=app --cov-report=html
```

**Cobertura:** ~95% (37 testes)

### Frontend (Jasmine/Karma)

```bash
cd frontend
npm test
```

**Cobertura:** ~90% (25 testes)

### CI/CD Automático

- ✅ Testes executam em cada push
- ✅ Build de produção validado
- ✅ Linting e verificações de segurança
- ✅ Deploy automático após merge

---

## 📊 Monitorização

### Scripts Incluídos

```bash
# Verificar saúde da aplicação
curl https://seu-backend.onrender.com/health

# Monitorizar uso de recursos
cd backend
python scripts/monitor_usage.py

# Manter serviço ativo (evita cold start)
python scripts/keep_alive.py --url https://seu-backend.onrender.com
```

### Dashboards

- 📊 **Render:** Métricas de CPU, RAM, rede
- 📊 **Vercel:** Analytics, builds, deploys
- 📊 **GitHub Actions:** Status de workflows

📖 **Guia completo:** [docs/MONITORING.md](docs/MONITORING.md)

---

## 🔧 Configuração

### Variáveis de Ambiente (Backend)

```bash
# Segurança
SECRET_KEY=          # Gerar com: python -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY=      # Gerar com: python -c "import secrets; print(secrets.token_hex(32))"
JWT_ACCESS_TOKEN_EXPIRES=30  # Minutos

# Base de Dados
DATABASE_URL=postgresql://user:pass@host:5432/db

# CORS
CORS_ORIGINS=http://localhost:4200,https://seu-frontend.vercel.app

# Rate Limiting
RATELIMIT_ENABLED=true
RATELIMIT_DEFAULT=100 per hour
```

### Variáveis de Ambiente (Frontend)

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://seu-backend.onrender.com/api'
};
```

---

## 👨‍💻 Autor

**Leonardo Reis**

- GitHub: [@Leonardo]([https://github.com/leonardo](https://github.com/Leonardo-Reis-al74689))
- Email: leonardomreis3@gmail.com


<div align="center">

**⭐ Se este projeto foi útil, dê uma estrela no GitHub! ⭐**

</div>

