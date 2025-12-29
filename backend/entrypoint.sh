#!/bin/bash
# Entrypoint script para inicializar DB e iniciar Gunicorn

set -e

echo "🔧 Verificando/Inicializando banco de dados..."

# Executar inicialização do banco de dados
python scripts/init_db.py

echo "✅ Banco de dados pronto!"
echo "🚀 Iniciando Gunicorn..."

# Iniciar Gunicorn
exec gunicorn --config gunicorn.conf.py main:app

