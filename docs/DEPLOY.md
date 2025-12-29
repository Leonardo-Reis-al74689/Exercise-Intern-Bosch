# 🚀 Guia Completo de Deploy - Task Manager

Este guia ensina como fazer o deploy completo da aplicação Task Manager usando plataformas gratuitas.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Deploy do Backend (Render)](#deploy-do-backend)
3. [Deploy do Frontend (Vercel)](#deploy-do-frontend)
4. [Configuração Final](#configuração-final)
5. [Verificação](#verificação)

---

## 🎯 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Conta no [GitHub](https://github.com)
- ✅ Conta no [Render](https://render.com) (gratuita, **SEM cartão de crédito**)
- ✅ Conta no [Vercel](https://vercel.com) (gratuita, **SEM cartão de crédito**)
- ✅ Código commitado e pushado para o GitHub
- ✅ Repositório público ou privado no GitHub

---

## 🗄️ PARTE 1: Deploy do Backend (Render)

### Passo 1: Criar Base de Dados PostgreSQL

1. **Aceder ao Render:**
   - Ir para [dashboard.render.com](https://dashboard.render.com)
   - Fazer login com GitHub

2. **Criar PostgreSQL:**
   - Clicar em **"New +"** > **"PostgreSQL"**
   - Preencher:
     - **Name:** `taskmanager-postgres`
     - **Database:** `taskmanager`
     - **User:** `taskmanager_user` (gerado automaticamente)
     - **Region:** `Frankfurt` (ou mais próximo de si)
     - **Plan:** **Free** (1GB storage)
   
3. **Criar e aguardar:**
   - Clicar em **"Create Database"**
   - Aguardar ~2 minutos até ficar "Available"
   
4. **Copiar Connection String:**
   - Na página da BD, encontrar **"Internal Database URL"**
   - Copiar o URL (formato: `postgresql://user:pass@host/db`)
   - **GUARDAR** este URL para o próximo passo

---

### Passo 2: Criar Web Service (Backend Flask)

1. **Criar novo serviço:**
   - Voltar ao dashboard do Render
   - Clicar em **"New +"** > **"Web Service"**

2. **Conectar repositório:**
   - Escolher **"Build and deploy from a Git repository"**
   - Clicar em **"Connect"** ao lado do repositório do GitHub
   - Se não aparecer, clicar em **"Configure account"** para autorizar

3. **Configurar serviço:**
   - **Name:** `taskmanager-backend`
   - **Region:** `Frankfurt` (mesma da BD)
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:**
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     gunicorn --config gunicorn.conf.py main:app
     ```
   - **Plan:** **Free** (750 horas/mês)

4. **Configurar variáveis de ambiente:**
   
   Clicar em **"Advanced"** > **"Add Environment Variable"**
   
   Adicionar estas variáveis:
   
   | Key | Value | Notas |
   |-----|-------|-------|
   | `FLASK_ENV` | `production` | |
   | `SECRET_KEY` | `[GERAR]` | Ver como gerar abaixo ⬇️ |
   | `JWT_SECRET_KEY` | `[GERAR]` | Ver como gerar abaixo ⬇️ |
   | `JWT_ACCESS_TOKEN_EXPIRES` | `30` | |
   | `DATABASE_URL` | `[URL_COPIADO]` | URL da BD do passo 1 |
   | `CORS_ORIGINS` | `http://localhost:4200` | Atualizar depois |
   | `RATELIMIT_ENABLED` | `true` | |
   | `RATELIMIT_DEFAULT` | `100 per hour` | |
   | `GUNICORN_WORKERS` | `2` | |
   | `GUNICORN_THREADS` | `2` | |
   | `LOG_LEVEL` | `info` | |

   **Como gerar SECRET_KEY e JWT_SECRET_KEY:**
   ```bash
   # No terminal local:
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
   Execute este comando 2x e use valores diferentes para cada chave.

5. **Deploy:**
   - Clicar em **"Create Web Service"**
   - Aguardar ~5-10 minutos para primeiro deploy
   - Verificar logs para confirmar que iniciou sem erros

6. **Copiar URL do backend:**
   - No topo da página, copiar a URL (ex: `https://taskmanager-backend.onrender.com`)
   - **GUARDAR** para configurar o frontend

---

## 🎨 PARTE 2: Deploy do Frontend (Vercel)

### Passo 1: Atualizar configuração de produção

**Antes de fazer o deploy**, atualizar o ficheiro de ambiente:

1. Abrir `frontend/src/environments/environment.prod.ts`

2. Atualizar com a URL do backend:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://taskmanager-backend.onrender.com/api'
     // ⬆️ Substituir com a URL real do backend
   };
   ```

3. Fazer commit e push:
   ```bash
   git add frontend/src/environments/environment.prod.ts
   git commit -m "config: atualizar URL do backend em produção"
   git push origin main
   ```

---

### Passo 2: Deploy no Vercel

1. **Aceder ao Vercel:**
   - Ir para [vercel.com](https://vercel.com)
   - Fazer login com GitHub

2. **Importar projeto:**
   - Clicar em **"Add New..."** > **"Project"**
   - Selecionar o repositório do GitHub
   - Se não aparecer, configurar permissões do GitHub

3. **Configurar projeto:**
   - **Project Name:** `taskmanager-frontend`
   - **Framework Preset:** Angular (detetado automaticamente)
   - **Root Directory:** `frontend`
   - **Build Command:**
     ```bash
     npm install --legacy-peer-deps && npm run build -- --configuration production
     ```
   - **Output Directory:** `dist/task-manager-frontend`
   - **Install Command:**
     ```bash
     npm install --legacy-peer-deps
     ```

4. **Variáveis de ambiente** (se necessário):
   - Não são necessárias para este projeto
   - Angular usa ficheiros de ambiente em build time

5. **Deploy:**
   - Clicar em **"Deploy"**
   - Aguardar ~3-5 minutos
   - Verificar se o deploy foi bem-sucedido

6. **Copiar URL do frontend:**
   - Após deploy, copiar a URL (ex: `https://taskmanager-frontend.vercel.app`)
   - **GUARDAR** para atualizar CORS no backend

---

## 🔗 PARTE 3: Configuração Final

### Atualizar CORS no Backend

1. **Voltar ao Render:**
   - Ir para o dashboard do backend
   - Clicar em **"Environment"** no menu lateral

2. **Atualizar variável CORS_ORIGINS:**
   - Encontrar `CORS_ORIGINS`
   - Alterar valor para:
     ```
     http://localhost:4200,https://taskmanager-frontend.vercel.app
     ```
     (Substituir pela URL real do Vercel)

3. **Guardar:**
   - Clicar em **"Save Changes"**
   - O serviço reiniciará automaticamente (~30s)

---

### Configurar Keep-Alive (Opcional mas Recomendado)

O serviço gratuito do Render "dorme" após 15 min de inatividade. Para evitar:

1. **No GitHub:**
   - Ir para: **Settings** > **Secrets and variables** > **Actions**
   - Clicar em **"New repository secret"**
   - Nome: `BACKEND_URL`
   - Valor: `https://taskmanager-backend.onrender.com` (URL do backend)
   - Clicar em **"Add secret"**

2. **O workflow automático:**
   - O ficheiro `.github/workflows/keep-alive.yml` já está configurado
   - Executará automaticamente a cada 14 minutos
   - Mantém o backend "acordado"

---

## ✅ PARTE 4: Verificação

### Testar Backend

1. **Health Check:**
   ```bash
   curl https://taskmanager-backend.onrender.com/health
   ```
   
   Deve retornar:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "message": "API operacional"
   }
   ```

2. **Testar registo:**
   ```bash
   curl -X POST https://taskmanager-backend.onrender.com/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "teste",
       "email": "teste@exemplo.com",
       "password": "Teste123!"
     }'
   ```

### Testar Frontend

1. **Abrir no browser:**
   - Ir para `https://taskmanager-frontend.vercel.app`
   - Verificar se a página carrega sem erros

2. **Testar funcionalidades:**
   - ✅ Registo de novo utilizador
   - ✅ Login
   - ✅ Criar tarefa
   - ✅ Editar tarefa
   - ✅ Eliminar tarefa
   - ✅ Logout

3. **Verificar console do browser:**
   - Abrir DevTools (F12)
   - Verificar que não há erros de CORS
   - Verificar que requests à API funcionam

---

## 🎉 Deploy Concluído!

A sua aplicação está agora **100% online e gratuita**!

### URLs Finais:

- 🎨 **Frontend:** `https://taskmanager-frontend.vercel.app`
- 🔧 **Backend API:** `https://taskmanager-backend.onrender.com/api`
- 🗄️ **Base de Dados:** PostgreSQL no Render (interno)

---

## 📊 Limites dos Planos Gratuitos

### Render (Backend + BD):
- ✅ 750 horas/mês (suficiente para um serviço)
- ✅ 512MB RAM
- ✅ 1GB PostgreSQL
- ⚠️ Sleep após 15min (keep-alive resolve)

### Vercel (Frontend):
- ✅ 100GB bandwidth/mês
- ✅ Builds ilimitados (6000 min/mês)
- ✅ SSL/HTTPS automático
- ✅ CDN global

---

## 🔄 Atualizações Futuras

### Deploy Automático:

Ambas as plataformas têm **auto-deploy**:

1. **Fazer alterações no código**
2. **Commit e push:**
   ```bash
   git add .
   git commit -m "feat: nova funcionalidade"
   git push origin main
   ```
3. **Deploy automático:**
   - Render: ~5 min
   - Vercel: ~3 min

Sem necessidade de ações manuais! 🎉

---

## 📚 Próximos Passos

- 📖 Ver [DOCKER.md](./DOCKER.md) para desenvolvimento local
- 🔍 Ver [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) para resolver problemas
- 📊 Ver [MONITORING.md](./MONITORING.md) para monitorizar uso

---

## 🆘 Suporte

Se encontrar problemas:

1. Verificar logs no dashboard do Render/Vercel
2. Consultar [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
3. Verificar que todas as variáveis de ambiente estão corretas
4. Confirmar que CORS está configurado corretamente

