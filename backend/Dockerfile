# ==========================================
# STAGE 1: Builder - Instalar dependências
# ==========================================
FROM python:3.13-slim as builder

# Metadados da imagem
LABEL maintainer="Task Manager API"
LABEL description="Backend Flask para Task Manager"

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema necessárias para compilação
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar ficheiro de dependências
COPY requirements.txt .

# Criar ambiente virtual e instalar dependências Python
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ==========================================
# STAGE 2: Runtime - Imagem final otimizada
# ==========================================
FROM python:3.13-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar apenas dependências runtime do PostgreSQL
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar ambiente virtual do builder
COPY --from=builder /opt/venv /opt/venv

# Definir PATH para usar o venv
ENV PATH="/opt/venv/bin:$PATH"

# Copiar código da aplicação
COPY . .

# Dar permissão de execução ao entrypoint
RUN chmod +x /app/entrypoint.sh

# Criar utilizador não-root para segurança
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

# Mudar para utilizador não-root
USER appuser

# Variáveis de ambiente padrão
ENV PYTHONUNBUFFERED=1
ENV FLASK_APP=main.py
ENV PYTHONDONTWRITEBYTECODE=1

# Expor porta da aplicação
EXPOSE 5000

# Healthcheck para monitorização
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:5000/health || exit 1

# Comando de inicialização usando entrypoint (inicializa DB + Gunicorn)
CMD ["/app/entrypoint.sh"]

