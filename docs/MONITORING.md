# 📊 Monitorização e Manutenção - Task Manager

Guia para monitorizar o uso de recursos e manter a aplicação saudável.

## 📋 Índice

1. [Monitorização de Recursos](#monitorização-de-recursos)
2. [Alertas e Limites](#alertas-e-limites)
3. [Logs e Debugging](#logs-e-debugging)
4. [Métricas Importantes](#métricas-importantes)
5. [Manutenção Regular](#manutenção-regular)
6. [Backups](#backups)

---

## 📈 Monitorização de Recursos

### Limites dos Planos Gratuitos

#### Render (Backend + PostgreSQL)

| Recurso | Limite Gratuito | Uso Recomendado | Alerta em |
|---------|-----------------|-----------------|-----------|
| **Horas mensais** | 750h | < 500h | 525h (70%) |
| **RAM** | 512MB | < 400MB | 435MB (85%) |
| **Largura de banda** | 100GB/mês | < 70GB | 85GB (85%) |
| **PostgreSQL Storage** | 1GB | < 700MB | 850MB (85%) |
| **Conexões BD** | 100 | < 50 | 85 (85%) |

#### Vercel (Frontend)

| Recurso | Limite Gratuito | Uso Recomendado | Alerta em |
|---------|-----------------|-----------------|-----------|
| **Build minutos** | 6.000 min/mês | < 500 min | 4.200 min (70%) |
| **Largura de banda** | 100GB/mês | < 70GB | 85GB (85%) |
| **Deploys** | Ilimitado | - | - |

---

## 🎛️ Dashboards de Monitorização

### Render Dashboard

1. **Aceder:**
   - [dashboard.render.com](https://dashboard.render.com)
   - Selecionar serviço (Backend ou PostgreSQL)

2. **Métricas disponíveis:**
   - 📊 **CPU Usage:** Uso de processador
   - 📊 **Memory Usage:** Uso de RAM
   - 📊 **Disk Usage:** Espaço em disco
   - 📊 **Network:** Tráfego de rede
   - 📊 **Response Time:** Tempo de resposta

3. **Como verificar:**
   ```
   Dashboard > Seu serviço > Metrics
   ```

### Vercel Dashboard

1. **Aceder:**
   - [vercel.com/dashboard](https://vercel.com/dashboard)
   - Selecionar projeto

2. **Métricas disponíveis:**
   - 📊 **Build Time:** Tempo de compilação
   - 📊 **Deployment Frequency:** Frequência de deploys
   - 📊 **Bandwidth:** Uso de banda
   - 📊 **Edge Requests:** Número de requests

3. **Como verificar:**
   ```
   Dashboard > Projeto > Analytics
   ```

---

## 🚨 Alertas e Limites

### Configurar Alertas no Render

1. **Email notifications:**
   - Settings > Account > Notifications
   - Ativar "Service health notifications"
   - Ativar "Billing notifications"

2. **Tipos de alertas:**
   - ✉️ Deploy failed
   - ✉️ Service down
   - ✉️ High memory usage
   - ✉️ Approaching limits

### Configurar Alertas no Vercel

1. **Email notifications:**
   - Settings > Notifications
   - Ativar alertas de deploy

2. **Tipos de alertas:**
   - ✉️ Build failed
   - ✉️ Deployment succeeded/failed
   - ✉️ Usage limits approaching

---

## 🔍 Logs e Debugging

### Ver Logs do Backend (Render)

**Via Dashboard:**
```
Dashboard > Backend Service > Logs
```

**Comandos úteis:**
- Filtrar por erro: Procurar "ERROR" ou "Exception"
- Ver requests: Procurar "GET" ou "POST"
- Tempo real: Ativar "Auto-scroll"

**Exemplo de log saudável:**
```
[INFO] Gunicorn pronto! Workers: 2, Threads: 2
[INFO] 127.0.0.1 - "GET /health HTTP/1.1" 200 -
[INFO] 127.0.0.1 - "POST /api/auth/login HTTP/1.1" 200 -
```

**Exemplo de log com problema:**
```
[ERROR] Connection to database failed
[ERROR] psycopg2.OperationalError: could not connect
```

### Ver Logs do Frontend (Vercel)

**Via Dashboard:**
```
Dashboard > Projeto > Deployments > Ver deployment > Logs
```

**Tipos de logs:**
- 🏗️ **Build Logs:** Compilação do Angular
- 🚀 **Function Logs:** Execução (se tiver functions)
- 📊 **Edge Logs:** Requests (só em plano pago)

### Logs Locais (Desenvolvimento)

**Backend:**
```bash
# Com Docker
docker-compose -f docker/docker-compose.yml logs -f backend

# Sem Docker
cd backend
python main.py
```

**Frontend:**
```bash
# Browser DevTools
F12 > Console
```

---

## 📊 Métricas Importantes

### Script de Monitorização

Usar o script incluído no projeto:

```bash
# Executar localmente (conecta à BD)
cd backend
python scripts/monitor_usage.py

# Guardar relatório em ficheiro
python scripts/monitor_usage.py --save
```

**Saída exemplo:**
```
📊 RELATÓRIO DE MONITORIZAÇÃO - 2024-01-15 10:30:00
============================================================

✅ Disco Local
   Nível: OK
   total_gb: 10.0
   used_gb: 2.5
   free_gb: 7.5
   Uso: 25%

✅ Base de Dados PostgreSQL
   Nível: OK
   size_mb: 45.32
   size_gb: 0.044
   Limite: 1
   Uso: 4.4%

📈 Contagem de Registos
   Utilizadores: 25
   Tarefas: 150
```

---

## 🔧 Queries Úteis de Monitorização

### Tamanho da Base de Dados

```sql
-- Tamanho total da BD
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Tamanho por tabela
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Conexões Ativas

```sql
-- Número de conexões
SELECT count(*) FROM pg_stat_activity;

-- Conexões por estado
SELECT state, count(*) 
FROM pg_stat_activity 
GROUP BY state;
```

### Queries Lentas

```sql
-- Top 10 queries mais lentas (requer pg_stat_statements)
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 🛠️ Manutenção Regular

### Checklist Semanal

- [ ] Verificar logs de erros
- [ ] Confirmar que serviços estão "healthy"
- [ ] Verificar uso de recursos (< 70%)
- [ ] Testar funcionalidades principais
- [ ] Verificar que Keep-Alive está a executar

### Checklist Mensal

- [ ] Rever uso total de recursos
- [ ] Analisar métricas de performance
- [ ] Verificar espaço da base de dados
- [ ] Atualizar dependências (se necessário)
- [ ] Fazer backup da base de dados
- [ ] Rever logs de segurança

### Checklist Trimestral

- [ ] Otimizar base de dados (VACUUM, REINDEX)
- [ ] Limpar dados antigos/desnecessários
- [ ] Atualizar documentação
- [ ] Revisar alertas e thresholds
- [ ] Testar processo de restore de backup

---

## 💾 Backups

### Backup Manual da Base de Dados

**Via Render Dashboard:**
```
Dashboard > PostgreSQL > Backups
```
- Render faz backups automáticos (plano free: 7 dias)
- Fazer download manual: "Create Backup" > Download

**Via pg_dump (linha de comando):**
```bash
# Obter DATABASE_URL do Render
# Dashboard > PostgreSQL > Info > External Database URL

# Fazer backup
pg_dump "postgresql://user:pass@host/db" > backup_$(date +%Y%m%d).sql

# Fazer backup comprimido
pg_dump "postgresql://user:pass@host/db" | gzip > backup_$(date +%Y%m%d).sql.gz
```

### Restore de Backup

```bash
# Restore de backup SQL
psql "postgresql://user:pass@host/db" < backup_20240115.sql

# Restore de backup comprimido
gunzip -c backup_20240115.sql.gz | psql "postgresql://user:pass@host/db"
```

### Automação de Backups (Avançado)

**Criar workflow GitHub Actions:**

```yaml
# .github/workflows/backup.yml
name: Database Backup

on:
  schedule:
    - cron: '0 2 * * 0'  # Domingo às 2h AM
  workflow_dispatch:

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - name: Backup Database
        run: |
          pg_dump "${{ secrets.DATABASE_URL }}" | gzip > backup.sql.gz
      
      - name: Upload to Storage
        # Implementar upload para Google Drive, Dropbox, etc.
```

---

## 📉 Otimização de Recursos

### Reduzir Uso de RAM (Backend)

1. **Reduzir workers do Gunicorn:**
   ```python
   # gunicorn.conf.py
   workers = 1  # Em vez de 2
   threads = 2
   ```

2. **Usar worker timeout menor:**
   ```python
   timeout = 60  # Em vez de 120
   ```

### Reduzir Uso de Storage (PostgreSQL)

1. **Limpar tarefas antigas:**
   ```sql
   -- Eliminar tarefas completas com > 90 dias
   DELETE FROM task 
   WHERE status = 'COMPLETED' 
   AND updated_at < NOW() - INTERVAL '90 days';
   ```

2. **Otimizar BD:**
   ```sql
   VACUUM FULL;
   ANALYZE;
   ```

### Reduzir Uso de Banda (Frontend)

1. **Otimizar imagens:**
   - Comprimir imagens (TinyPNG, ImageOptim)
   - Usar WebP em vez de PNG/JPG
   - Lazy loading de imagens

2. **Habilitar compressão:**
   - Já configurado no `nginx.conf` ✅
   - Gzip para texto, CSS, JS

---

## 🎯 KPIs Recomendados

### Performance

| Métrica | Target | Crítico |
|---------|--------|---------|
| **Response Time (API)** | < 200ms | > 1000ms |
| **Page Load Time** | < 2s | > 5s |
| **Error Rate** | < 1% | > 5% |
| **Uptime** | > 99% | < 95% |

### Recursos

| Métrica | Saudável | Atenção | Crítico |
|---------|----------|---------|---------|
| **RAM Usage** | < 300MB | 300-450MB | > 450MB |
| **DB Storage** | < 500MB | 500-900MB | > 900MB |
| **Monthly Hours** | < 500h | 500-700h | > 700h |

---

## 🔔 Notificações Proativas

### Configurar Webhooks (Avançado)

**Render > Service > Settings > Webhooks:**
- Deploy succeeded/failed
- Service health changes
- Enviar para Slack, Discord, etc.

**Exemplo Slack webhook:**
```
https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## 📱 Apps de Monitorização

### Opções Gratuitas:

1. **UptimeRobot** (uptime monitoring)
   - Gratuito: 50 monitores
   - Alerta via email/SMS
   - Verificação a cada 5 minutos

2. **StatusCake** (uptime + performance)
   - Gratuito: monitoring básico
   - Alertas por email

3. **Render Native Monitoring**
   - Incluído no plano gratuito
   - Dashboards no próprio Render

---

## 🆘 Quando Preocupar-se?

### 🟢 Tudo Normal:
- CPU < 50%
- RAM < 300MB
- DB < 500MB
- Uptime > 99%
- Response time < 500ms

### 🟡 Atenção:
- CPU 50-80%
- RAM 300-450MB
- DB 500-900MB
- Uptime 95-99%
- Response time 500-1000ms

### 🔴 Crítico:
- CPU > 80%
- RAM > 450MB
- DB > 900MB
- Uptime < 95%
- Response time > 1000ms

---

## 📚 Recursos Adicionais

- 📖 [Render Status Page](https://status.render.com/)
- 📖 [Vercel Status](https://www.vercel-status.com/)
- 📖 [PostgreSQL Monitoring](https://www.postgresql.org/docs/current/monitoring.html)

---

## ✅ Resumo

**Rotina de Monitorização:**

1. **Diariamente:** Verificar que serviços estão "up"
2. **Semanalmente:** Rever logs e uso de recursos
3. **Mensalmente:** Análise completa + backup
4. **Trimestralmente:** Otimização + limpeza

**Alertas automáticos configurados:**
- ✅ Email de deploy failed
- ✅ Email de service down
- ✅ GitHub Actions keep-alive
- ✅ Render native health checks

Com esta rotina, a aplicação manterá-se saudável e dentro dos limites gratuitos! 🎉

