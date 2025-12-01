# Task Manager - Backend Flask

Backend REST API desenvolvido em Flask para o sistema de gestão de tarefas.

## 🚀 Tecnologias

- **Flask** - Framework web Python
- **SQLAlchemy** - ORM para base de dados
- **Flask-JWT-Extended** - Autenticação JWT
- **PostgreSQL** - Base de dados relacional
- **Pydantic** - Validação de dados
- **Passlib** - Hash de palavras-passe

## 📋 Pré-requisitos

- Python 3.8+
- PostgreSQL instalado e em execução
- pip (gestor de pacotes Python)

## 🔧 Instalação

1. **Instalar dependências:**

```bash
pip install -r requirements.txt
```

2. **Configurar variáveis de ambiente:**

Crie um ficheiro `.env` na raiz do backend com as seguintes variáveis:

```
DATABASE_URL=postgresql://postgres:password@localhost/taskmanager
SECRET_KEY=your-secret-key-change-this-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-this-in-production
JWT_ACCESS_TOKEN_EXPIRES=30
```

3. **Criar base de dados:**

```bash
createdb taskmanager
```

Ou via PostgreSQL:

```sql
CREATE DATABASE taskmanager;
```

## 🏃 Executar a aplicação

```bash
python main.py
```

A API estará disponível em `http://localhost:5000`

## 📚 Endpoints da API

### Rotas Públicas

#### POST `/api/auth/register`
Registar novo utilizador

**Body:**
```json
{
  "username": "utilizador",
  "email": "utilizador@example.com",
  "password": "palavra-passe123"
}
```

#### POST `/api/auth/login`
Iniciar sessão

**Body:**
```json
{
  "username": "utilizador",
  "password": "palavra-passe123"
}
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "user": {...}
}
```

### Rotas Privadas (requerem autenticação)

Todas as rotas privadas requerem o header:
```
Authorization: Bearer <access_token>
```

#### GET `/api/tasks`
Listar todas as tarefas do utilizador autenticado

#### POST `/api/tasks`
Criar nova tarefa

**Body:**
```json
{
  "title": "A minha tarefa",
  "description": "Descrição da tarefa",
  "completed": false
}
```

#### GET `/api/tasks/<task_id>`
Obter tarefa específica

#### PUT `/api/tasks/<task_id>`
Atualizar tarefa

**Body:**
```json
{
  "title": "Tarefa atualizada",
  "completed": true
}
```

#### DELETE `/api/tasks/<task_id>`
Eliminar tarefa

## 🔒 Segurança

- **Autenticação JWT**: Tokens com expiração configurável
- **Hash de Palavras-passe**: Bcrypt com salt automático
- **Isolamento de Recursos**: Utilizadores só acedem às suas próprias tarefas
- **Validação de Dados**: Pydantic + sanitização personalizada
- **Headers de Segurança**: XSS, Clickjacking, MIME sniffing protection
- **CORS Restritivo**: Apenas origens permitidas
- **Rate Limiting**: Prevenção de abuso (opcional)
- **Proteção SQL Injection**: SQLAlchemy ORM com prepared statements
- **Tratamento de Erros Seguro**: Não expõe informações sensíveis

## 📁 Estrutura do Projeto

```
backend/
├── app/
│   ├── __init__.py          # Factory da aplicação
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── user.py
│   │   └── task.py
│   ├── routes/              # Blueprints de rotas (apenas HTTP)
│   │   ├── auth.py
│   │   └── tasks.py
│   ├── services/            # Service Layer (lógica de negócio)
│   │   ├── auth_service.py
│   │   └── task_service.py
│   ├── schemas/             # Schemas Pydantic
│   │   ├── user.py
│   │   └── task.py
│   ├── enums/               # Enumerações (constantes tipadas)
│   │   ├── error_codes.py
│   │   ├── http_status.py
│   │   └── task_status.py
│   ├── exceptions/          # Exceções personalizadas
│   │   └── custom_exceptions.py
│   ├── middleware/          # Middleware (segurança, erros)
│   │   ├── error_handler.py
│   │   ├── security_headers.py
│   │   └── rate_limiter.py
│   └── utils/               # Utilitários
│       ├── security.py      # Hash de palavras-passe
│       ├── decorators.py    # Decoradores
│       └── validators.py    # Validação e sanitização
├── config.py                # Configurações
├── main.py                  # Ponto de entrada
├── requirements.txt         # Dependências
└── ARCHITECTURE.md         # Documentação de arquitetura
```

## 🏗️ Padrões de POO Implementados

O código segue princípios de Programação Orientada a Objetos:

- **Enums**: Constantes tipadas (`ErrorCode`, `HTTPStatus`, `TaskStatus`)
- **Service Layer**: Lógica de negócio separada das rotas
- **Exceções Personalizadas**: Hierarquia de exceções para tratamento padronizado
- **Classes Utilitárias**: Validação e sanitização encapsuladas
- **Decorators**: Funcionalidades transversais reutilizáveis

Veja `ARCHITECTURE.md` para detalhes completos sobre os padrões implementados.

## 🧪 Testar a API

Pode testar a API utilizando ferramentas como:
- Postman
- Insomnia
- curl
- httpie

Exemplo com curl:

```bash
# Registar utilizador
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"teste","email":"teste@test.com","password":"123456"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teste","password":"123456"}'

# Listar tarefas (substitua TOKEN pelo token recebido)
curl -X GET http://localhost:5000/api/tasks \
  -H "Authorization: Bearer TOKEN"
```

