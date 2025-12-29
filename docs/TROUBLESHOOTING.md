# 🔧 Resolução de Problemas - Task Manager

Guia para resolver problemas comuns no deploy e uso da aplicação.

## 📋 Índice

1. [Problemas de Deploy](#problemas-de-deploy)
2. [Problemas de CORS](#problemas-de-cors)
3. [Problemas de Base de Dados](#problemas-de-base-de-dados)
4. [Problemas de Performance](#problemas-de-performance)
5. [Problemas de Autenticação](#problemas-de-autenticação)
6. [Problemas de Docker](#problemas-de-docker)

---

## 🚀 Problemas de Deploy

### Backend não inicia no Render

**Sintomas:**
- Deploy falha com erro
- Serviço fica em "Build failed"

**Verificações:**

1. **Verificar logs no Render:**
   - Dashboard > Backend service > Logs
   - Procurar por erros de sintaxe ou importação

2. **Verificar comandos de build:**
   ```bash
   # Build Command (deve ser):
   pip install --upgrade pip && pip install -r requirements.txt
   
   # Start Command (deve ser):
   gunicorn --config gunicorn.conf.py main:app
   ```

3. **Verificar variáveis de ambiente:**
   - Todas as variáveis necessárias estão definidas?
   - `DATABASE_URL` está correto?
   - `SECRET_KEY` e `JWT_SECRET_KEY` foram gerados?

4. **Testar localmente:**
   ```bash
   cd backend
   pip install -r requirements.txt
   gunicorn --config gunicorn.conf.py main:app
   ```

**Soluções comuns:**
- ✅ Adicionar `gunicorn==21.2.0` no `requirements.txt`
- ✅ Verificar que `main.py` tem `app = create_app()`
- ✅ Confirmar que `gunicorn.conf.py` existe

---

### Frontend não carrega no Vercel

**Sintomas:**
- Build falha
- Página em branco
- Erro 404 em rotas

**Verificações:**

1. **Verificar logs de build:**
   - Vercel Dashboard > Deployments > Ver logs
   - Procurar erros de compilação Angular

2. **Verificar configuração:**
   - Root Directory: `frontend` ✅
   - Build Command: `npm install --legacy-peer-deps && npm run build -- --configuration production` ✅
   - Output Directory: `dist/task-manager-frontend` ✅

3. **Testar build localmente:**
   ```bash
   cd frontend
   npm install --legacy-peer-deps
   npm run build -- --configuration production
   ```

**Soluções comuns:**
- ✅ Adicionar `--legacy-peer-deps` ao comando de instalação
- ✅ Verificar que `vercel.json` está configurado corretamente
- ✅ Confirmar que `environment.prod.ts` existe

---

### Cold Start muito lento

**Sintoma:**
- Primeiro request demora 30-60 segundos
- Aplicação "adormece" após 15 minutos

**Causa:**
- Plano gratuito do Render dorme após inatividade

**Soluções:**

1. **Ativar Keep-Alive (recomendado):**
   - Configurar GitHub Actions (ver [DEPLOY.md](./DEPLOY.md#configurar-keep-alive))
   - Workflow faz ping a cada 14 minutos
   - **100% gratuito** (usa GitHub Actions)

2. **Usar serviço externo:**
   - [cron-job.org](https://cron-job.org) - gratuito
   - Criar job que faz request a `/health` a cada 14 minutos

3. **Aceitar o cold start:**
   - Para projetos pessoais/portfolio é aceitável
   - Utilizadores aguardam ~30s no primeiro acesso

---

## 🌐 Problemas de CORS

### Erro: "CORS policy blocked"

**Sintomas:**
```
Access to XMLHttpRequest at 'https://backend.onrender.com/api/auth/login' 
from origin 'https://frontend.vercel.app' has been blocked by CORS policy
```

**Causa:**
- Backend não permite requests do domínio do frontend

**Solução:**

1. **Verificar CORS_ORIGINS no backend:**
   - Render Dashboard > Backend > Environment
   - Variável `CORS_ORIGINS` deve incluir URL do frontend:
     ```
     http://localhost:4200,https://taskmanager-frontend.vercel.app
     ```

2. **Verificar URL está correto:**
   - **SEM barra no final:** ✅ `https://frontend.vercel.app`
   - **COM barra no final:** ❌ `https://frontend.vercel.app/`

3. **Reiniciar backend:**
   - Render Dashboard > Backend > Manual Deploy > Deploy latest commit

4. **Testar:**
   ```bash
   curl -I https://seu-backend.onrender.com/api/auth/register \
     -H "Origin: https://seu-frontend.vercel.app"
   
   # Deve retornar header:
   # Access-Control-Allow-Origin: https://seu-frontend.vercel.app
   ```

---

### CORS funciona localmente mas não em produção

**Verificações:**

1. **Confirmar que `environment.prod.ts` está correto:**
   ```typescript
   apiUrl: 'https://seu-backend.onrender.com/api'
   // ⬆️ Deve apontar para backend em produção, não localhost
   ```

2. **Rebuild do frontend:**
   ```bash
   git add frontend/src/environments/environment.prod.ts
   git commit -m "fix: atualizar URL do backend"
   git push origin main
   ```

3. **Limpar cache do browser:**
   - Ctrl+Shift+Del > Limpar cache
   - Ou abrir em janela privada

---

## 🗄️ Problemas de Base de Dados

### Erro: "password authentication failed"

**Causa:**
- `DATABASE_URL` incorreto ou password errada

**Solução:**

1. **Copiar URL correto da BD:**
   - Render Dashboard > PostgreSQL > Info
   - Copiar **"Internal Database URL"**
   - Formato: `postgresql://user:password@host:port/database`

2. **Atualizar no backend:**
   - Render Dashboard > Backend > Environment
   - Variável `DATABASE_URL` = URL copiado acima
   - Guardar e aguardar reinício

3. **Testar conexão:**
   ```bash
   # No terminal do container Render (ou local com a URL)
   psql "postgresql://user:password@host:port/database"
   ```

---

### Erro: "relation does not exist"

**Sintoma:**
```
psycopg2.errors.UndefinedTable: relation "user" does not exist
```

**Causa:**
- Tabelas não foram criadas na base de dados

**Solução:**

1. **Criar tabelas automaticamente:**
   - O código já tem `db.create_all()` no `app/__init__.py`
   - Deve criar automaticamente no primeiro request

2. **Criar manualmente (se necessário):**
   ```bash
   # Local
   cd backend
   python scripts/init_db.py
   
   # Render (via shell)
   # Dashboard > Backend > Shell
   python scripts/init_db.py
   ```

3. **Usar Alembic (avançado):**
   ```bash
   alembic upgrade head
   ```

---

### Base de dados cheia (1GB)

**Sintomas:**
- Não consegue criar novas tarefas
- Erro de espaço em disco

**Soluções:**

1. **Verificar uso:**
   ```bash
   python scripts/monitor_usage.py
   ```

2. **Limpar dados antigos:**
   ```sql
   -- Eliminar tarefas completas com mais de 30 dias
   DELETE FROM task 
   WHERE status = 'COMPLETED' 
   AND updated_at < NOW() - INTERVAL '30 days';
   ```

3. **Otimizar BD:**
   ```sql
   VACUUM FULL;
   REINDEX DATABASE taskmanager;
   ```

4. **Alternativa:**
   - Migrar para outro serviço gratuito (Supabase, ElephantSQL)

---

## ⚡ Problemas de Performance

### Backend lento

**Verificações:**

1. **Verificar logs de tempo de resposta:**
   - Render Dashboard > Logs
   - Procurar requests lentos

2. **Otimizações:**
   ```python
   # Adicionar índices nas queries mais usadas
   # Em models/task.py:
   __table_args__ = (
       Index('idx_task_user_id', 'user_id'),
       Index('idx_task_status', 'status'),
   )
   ```

3. **Verificar N+1 queries:**
   ```python
   # Usar eager loading
   tasks = Task.query.options(joinedload(Task.user)).all()
   ```

---

### Frontend lento

**Otimizações:**

1. **Build de produção:**
   - Confirmar que está usando `--configuration production`
   - Minificação e tree-shaking devem estar ativos

2. **Lazy loading:**
   ```typescript
   // Carregar módulos sob demanda
   {
     path: 'tasks',
     loadChildren: () => import('./tasks/tasks.module').then(m => m.TasksModule)
   }
   ```

3. **Verificar tamanho do bundle:**
   ```bash
   npm run build -- --configuration production --stats-json
   npx webpack-bundle-analyzer dist/task-manager-frontend/stats.json
   ```

---

## 🔐 Problemas de Autenticação

### Token JWT inválido ou expirado

**Sintomas:**
```json
{
  "error": "Token has expired",
  "code": "TOKEN_EXPIRED"
}
```

**Soluções:**

1. **Fazer logout e login novamente**
   - Frontend limpa token automaticamente
   - Fazer novo login

2. **Aumentar tempo de expiração (se necessário):**
   - Render Dashboard > Backend > Environment
   - `JWT_ACCESS_TOKEN_EXPIRES` = `60` (minutos)

3. **Verificar relógio do sistema:**
   - Garantir que hora está sincronizada

---

### Não consegue fazer login

**Verificações:**

1. **Verificar credenciais:**
   - Username e password corretos?
   - Password tem requisitos mínimos?

2. **Verificar se utilizador existe:**
   ```sql
   SELECT * FROM "user" WHERE username = 'seu_username';
   ```

3. **Testar via cURL:**
   ```bash
   curl -X POST https://backend.onrender.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username":"user","password":"Pass123!"}'
   ```

4. **Ver logs do backend:**
   - Render Dashboard > Logs
   - Procurar por erros de autenticação

---

## 🐳 Problemas de Docker

### Ver [DOCKER.md](./DOCKER.md#resolução-de-problemas)

Problemas comuns de Docker estão documentados no guia Docker.

---

## 🆘 Ainda com Problemas?

### Checklist Final:

- [ ] Verificar logs (Render/Vercel Dashboard)
- [ ] Testar localmente (funciona local?)
- [ ] Verificar variáveis de ambiente
- [ ] Confirmar URLs estão corretos
- [ ] Limpar cache do browser
- [ ] Testar em janela privada
- [ ] Verificar CORS está configurado
- [ ] Confirmar BD está acessível
- [ ] Verificar GitHub Actions está a executar

### Debug Avançado:

**Backend:**
```bash
# Ativar logs detalhados
LOG_LEVEL=debug  # Na variável de ambiente

# Ver todas as rotas
flask routes

# Testar conexão BD
python -c "from app import db; print(db.engine.url)"
```

**Frontend:**
```typescript
// Adicionar logging
console.log('API URL:', environment.apiUrl);

// Ver requests no DevTools
// Network tab > Filter: XHR
```

---

## 📞 Recursos de Ajuda

- 📖 [Documentação Render](https://render.com/docs)
- 📖 [Documentação Vercel](https://vercel.com/docs)
- 📖 [Flask Documentation](https://flask.palletsprojects.com/)
- 📖 [Angular Documentation](https://angular.io/docs)
- 💬 [Stack Overflow](https://stackoverflow.com/)

---

**Não encontrou a solução?**
- Verificar mensagem de erro específica
- Pesquisar erro no Google/Stack Overflow
- Ver logs detalhados das plataformas

