"""
Configuração do Gunicorn para produção
Otimizado para o plano gratuito do Render (512MB RAM)
"""
import os
import multiprocessing

# Endereço de binding
bind = f"0.0.0.0:{os.getenv('PORT', '5000')}"

# Número de workers
# Fórmula: (2 x núcleos) + 1
# Para Render free tier (CPU compartilhada), usar 2 workers
workers = int(os.getenv('GUNICORN_WORKERS', '2'))

# Tipo de worker (sync para Flask simples)
worker_class = 'sync'

# Número de threads por worker
threads = int(os.getenv('GUNICORN_THREADS', '2'))

# Timeout para requests (em segundos)
timeout = 120

# Timeout para workers silenciosos (em segundos)
graceful_timeout = 120

# Keep-alive para conexões persistentes
keepalive = 5

# Restart workers após N requests (previne memory leaks)
max_requests = 1000
max_requests_jitter = 50

# Logging
accesslog = '-'  # STDOUT
errorlog = '-'   # STDERR
loglevel = os.getenv('LOG_LEVEL', 'info')

# Formato de log
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(D)s'

# Pre-load da aplicação (otimização de memória)
preload_app = True

# Callbacks para gestão de workers
def on_starting(server):
    """Executado quando o Gunicorn inicia"""
    print("🚀 Gunicorn a iniciar...")

def on_reload(server):
    """Executado quando a aplicação recarrega"""
    print("🔄 Aplicação a recarregar...")

def when_ready(server):
    """Executado quando o Gunicorn está pronto"""
    print(f"✅ Gunicorn pronto! Workers: {workers}, Threads: {threads}")

def worker_int(worker):
    """Executado quando um worker recebe SIGINT"""
    print(f"⚠️ Worker {worker.pid} interrompido")

def worker_abort(worker):
    """Executado quando um worker é abortado"""
    print(f"❌ Worker {worker.pid} abortado")

