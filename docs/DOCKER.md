# 🐳 Guia Docker - Task Manager

Este guia explica como usar Docker para desenvolvimento local da aplicação Task Manager.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração Inicial](#configuração-inicial)
3. [Comandos Docker](#comandos-docker)
4. [Desenvolvimento](#desenvolvimento)
5. [Resolução de Problemas](#resolução-de-problemas)

---

## 🎯 Pré-requisitos

### Instalar Docker

**Windows:**
- Instalar [Docker Desktop para Windows](https://docs.docker.com/desktop/install/windows-install/)
- Requer WSL 2
- Reiniciar após instalação

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker

# Adicionar utilizador ao grupo docker (evita sudo)
sudo usermod -aG docker $USER
# Fazer logout e login novamente
```

**macOS:**
- Instalar [Docker Desktop para Mac](https://docs.docker.com/desktop/install/mac-install/)

### Verificar instalação:
```bash
docker --version
docker-compose --version
```

---

## ⚙️ Configuração Inicial

### 1. Criar ficheiro de ambiente

Copiar o ficheiro de exemplo:

```bash
# Windows PowerShell
cp docker\env.docker.example docker\.env

# Linux/macOS
cp docker/env.docker.example docker/.env
```

Editar `docker/.env` se necessário (valores padrão já funcionam):

```bash
# Base de dados
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=taskmanager_dev
POSTGRES_PORT=5432

# Portas dos serviços
BACKEND_PORT=5000
FRONTEND_PORT=4200
```

---

## 🚀 Comandos Docker

### Iniciar todos os serviços

```bash
# Navegar para a pasta raiz do projeto
cd FullStack-Task-Manager

# Iniciar todos os serviços
docker-compose -f docker/docker-compose.yml up

# Ou em modo background (detached)
docker-compose -f docker/docker-compose.yml up -d
```

### Ver logs

```bash
# Todos os serviços
docker-compose -f docker/docker-compose.yml logs

# Apenas backend
docker-compose -f docker/docker-compose.yml logs backend

# Apenas frontend
docker-compose -f docker/docker-compose.yml logs frontend

# Seguir logs em tempo real
docker-compose -f docker/docker-compose.yml logs -f
```

### Parar serviços

```bash
# Parar todos os serviços
docker-compose -f docker/docker-compose.yml stop

# Parar e remover containers
docker-compose -f docker/docker-compose.yml down

# Parar, remover containers E volumes (apaga dados da BD)
docker-compose -f docker/docker-compose.yml down -v
```

### Reiniciar serviços

```bash
# Reiniciar todos
docker-compose -f docker/docker-compose.yml restart

# Reiniciar apenas backend
docker-compose -f docker/docker-compose.yml restart backend
```

### Verificar estado

```bash
# Ver containers em execução
docker-compose -f docker/docker-compose.yml ps

# Ver uso de recursos
docker stats
```

---

## 🛠️ Desenvolvimento

### Estrutura de Serviços

Quando executar `docker-compose up`, três serviços iniciam:

| Serviço | URL | Descrição |
|---------|-----|-----------|
| **postgres** | `localhost:5432` | Base de dados PostgreSQL |
| **backend** | `http://localhost:5000` | API Flask |
| **frontend** | `http://localhost:4200` | Angular App |

### Hot Reload (Desenvolvimento)

Os containers estão configurados para **hot reload**:

#### Backend (Flask):
- Alterações em ficheiros Python são detetadas automaticamente
- O servidor reinicia sozinho
- Ver logs: `docker-compose -f docker/docker-compose.yml logs -f backend`

#### Frontend (Angular):
- O container usa o build de produção (não tem hot reload)
- Para hot reload, executar frontend localmente:
  ```bash
  cd frontend
  npm install
  npm start
  ```

### Executar comandos dentro dos containers

```bash
# Abrir shell no container backend
docker-compose -f docker/docker-compose.yml exec backend bash

# Abrir shell no container frontend
docker-compose -f docker/docker-compose.yml exec frontend sh

# Aceder à base de dados PostgreSQL
docker-compose -f docker/docker-compose.yml exec postgres psql -U postgres -d taskmanager_dev
```

### Exemplos de comandos úteis

#### Backend - Executar testes:
```bash
docker-compose -f docker/docker-compose.yml exec backend pytest
```

#### Backend - Inicializar BD:
```bash
docker-compose -f docker/docker-compose.yml exec backend python scripts/init_db.py --seed
```

#### Backend - Ver tabelas da BD:
```bash
docker-compose -f docker/docker-compose.yml exec postgres psql -U postgres -d taskmanager_dev -c "\dt"
```

#### Backend - Instalar nova dependência:
```bash
# 1. Adicionar ao requirements.txt
# 2. Rebuild do container
docker-compose -f docker/docker-compose.yml build backend
docker-compose -f docker/docker-compose.yml up -d backend
```

---

## 🏗️ Build e Deploy

### Build manual de imagens

```bash
# Build apenas backend
docker build -t taskmanager-backend:latest ./backend

# Build apenas frontend
docker build -t taskmanager-frontend:latest ./frontend

# Build com docker-compose
docker-compose -f docker/docker-compose.yml build

# Build sem cache (clean build)
docker-compose -f docker/docker-compose.yml build --no-cache
```

### Testar build de produção

```bash
# Usar ficheiro docker-compose.prod.yml (referência)
docker-compose -f docker/docker-compose.prod.yml up
```

**⚠️ Nota:** O ficheiro `docker-compose.prod.yml` é apenas referência. Em produção, usar Render/Vercel.

---

## 🧹 Limpeza

### Remover containers parados

```bash
docker-compose -f docker/docker-compose.yml down
```

### Remover volumes (apaga dados)

```bash
docker-compose -f docker/docker-compose.yml down -v
```

### Limpar sistema completo (cuidado!)

```bash
# Remover containers parados
docker container prune

# Remover imagens não usadas
docker image prune

# Remover volumes não usados
docker volume prune

# Limpar tudo (containers, imagens, volumes, networks)
docker system prune -a --volumes
```

---

## 🐛 Resolução de Problemas

### Problema: Porta já em uso

**Erro:**
```
Error starting userland proxy: listen tcp4 0.0.0.0:5000: bind: address already in use
```

**Solução 1:** Parar processo que usa a porta
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS
lsof -ti:5000 | xargs kill -9
```

**Solução 2:** Alterar porta no `docker/.env`
```bash
BACKEND_PORT=5001  # ou outra porta livre
```

---

### Problema: BD não conecta

**Erro:**
```
FATAL: password authentication failed for user "postgres"
```

**Solução:**
```bash
# 1. Parar todos os containers
docker-compose -f docker/docker-compose.yml down -v

# 2. Remover volumes
docker volume rm taskmanager_postgres_data

# 3. Reiniciar
docker-compose -f docker/docker-compose.yml up -d
```

---

### Problema: Container fica reiniciando

**Ver logs:**
```bash
docker-compose -f docker/docker-compose.yml logs backend
```

**Soluções comuns:**
- Erro de sintaxe no código → verificar logs
- Dependência faltando → rebuild container
- Variável de ambiente incorreta → verificar `docker/.env`

---

### Problema: Alterações não aparecem

**Backend:**
- Verificar se volumes estão montados corretamente
- Reiniciar container: `docker-compose -f docker/docker-compose.yml restart backend`

**Frontend:**
- O container usa build estático (sem hot reload)
- Executar frontend localmente para desenvolvimento:
  ```bash
  cd frontend
  npm start
  ```

---

### Problema: Espaço em disco cheio

**Ver uso de espaço:**
```bash
docker system df
```

**Limpar espaço:**
```bash
# Remover imagens antigas
docker image prune -a

# Remover volumes não usados
docker volume prune

# Limpeza completa
docker system prune -a --volumes
```

---

## 📊 Verificação de Saúde

### Health Checks

Os containers têm health checks configurados:

```bash
# Ver estado de saúde
docker ps

# Coluna STATUS mostrará:
# - healthy ✅
# - unhealthy ❌
# - starting 🔄
```

### Testar endpoints

```bash
# Health check do backend
curl http://localhost:5000/health

# Health check do frontend
curl http://localhost:4200/health
```

---

## 🎓 Boas Práticas

### Desenvolvimento Local

✅ **Fazer:**
- Usar `docker-compose up` para ambiente completo
- Verificar logs regularmente
- Fazer backup de dados importantes antes de `down -v`
- Manter imagens atualizadas: `docker-compose pull`

❌ **Evitar:**
- Usar `--privileged` sem necessidade
- Executar containers como root (já configurado para não-root)
- Commitar ficheiros `.env` com secrets

### Performance

- **Usar volumes nomeados** para dados persistentes ✅
- **Limitar RAM/CPU** se necessário:
  ```yaml
  deploy:
    resources:
      limits:
        cpus: '0.5'
        memory: 512M
  ```

---

## 📚 Recursos Adicionais

- 📖 [Documentação Docker](https://docs.docker.com/)
- 📖 [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- 📖 [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)

---

## 🆘 Suporte

Problemas com Docker?

1. ✅ Verificar logs: `docker-compose logs`
2. ✅ Ver esta documentação
3. ✅ Consultar [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
4. ✅ Verificar Docker Desktop está a executar (Windows/macOS)

