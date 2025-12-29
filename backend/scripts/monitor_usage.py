#!/usr/bin/env python
"""
Script de monitorização de uso de recursos
Verifica limites dos planos gratuitos e envia alertas

ATENÇÃO: Render não tem API pública de métricas no plano gratuito
Este script serve como template para quando tiver acesso à API

Uso:
    python scripts/monitor_usage.py
    python scripts/monitor_usage.py --alert-email seu@email.com
"""
import os
import sys
import argparse
from datetime import datetime
import json


# Limites do plano gratuito do Render
RENDER_FREE_LIMITS = {
    'monthly_hours': 750,
    'ram_mb': 512,
    'bandwidth_gb': 100,
    'postgres_storage_gb': 1
}

# Thresholds de alerta (percentagem)
ALERT_THRESHOLDS = {
    'warning': 70,   # 70% - aviso
    'urgent': 85,    # 85% - urgente
    'critical': 95   # 95% - crítico
}


def check_disk_usage(path='/'):
    """
    Verifica uso de disco (funciona dentro do container)
    
    Args:
        path: Caminho a verificar
        
    Returns:
        dict: Informações de uso de disco
    """
    try:
        import shutil
        stat = shutil.disk_usage(path)
        
        total_gb = stat.total / (1024**3)
        used_gb = stat.used / (1024**3)
        free_gb = stat.free / (1024**3)
        percent = (stat.used / stat.total) * 100
        
        return {
            'total_gb': round(total_gb, 2),
            'used_gb': round(used_gb, 2),
            'free_gb': round(free_gb, 2),
            'percent': round(percent, 2)
        }
    except Exception as e:
        return {'error': str(e)}


def check_database_size():
    """
    Verifica tamanho da base de dados PostgreSQL
    
    Returns:
        dict: Informações de uso da BD
    """
    try:
        # Importar dentro da função para evitar erros se BD não disponível
        parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sys.path.insert(0, parent_dir)
        
        from app import create_app, db
        
        app = create_app()
        with app.app_context():
            # Query para obter tamanho da BD
            query = """
                SELECT 
                    pg_size_pretty(pg_database_size(current_database())) as size,
                    pg_database_size(current_database()) as size_bytes
            """
            result = db.session.execute(db.text(query)).fetchone()
            
            size_bytes = result.size_bytes if result else 0
            size_mb = size_bytes / (1024**2)
            size_gb = size_bytes / (1024**3)
            
            # Calcular percentagem do limite (1GB)
            percent = (size_gb / RENDER_FREE_LIMITS['postgres_storage_gb']) * 100
            
            return {
                'size_mb': round(size_mb, 2),
                'size_gb': round(size_gb, 4),
                'percent': round(percent, 2),
                'limit_gb': RENDER_FREE_LIMITS['postgres_storage_gb']
            }
    except Exception as e:
        return {'error': str(e)}


def check_table_counts():
    """
    Conta registos em cada tabela
    
    Returns:
        dict: Contagem de registos
    """
    try:
        parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        sys.path.insert(0, parent_dir)
        
        from app import create_app, db
        from app.models.user import User
        from app.models.task import Task
        
        app = create_app()
        with app.app_context():
            return {
                'users': User.query.count(),
                'tasks': Task.query.count()
            }
    except Exception as e:
        return {'error': str(e)}


def get_alert_level(percent):
    """
    Determina nível de alerta baseado na percentagem de uso
    
    Args:
        percent: Percentagem de uso
        
    Returns:
        str: Nível de alerta
    """
    if percent >= ALERT_THRESHOLDS['critical']:
        return 'CRÍTICO'
    elif percent >= ALERT_THRESHOLDS['urgent']:
        return 'URGENTE'
    elif percent >= ALERT_THRESHOLDS['warning']:
        return 'AVISO'
    else:
        return 'OK'


def format_alert(label, data, limit_key=None):
    """
    Formata mensagem de alerta
    
    Args:
        label: Etiqueta do recurso
        data: Dados do recurso
        limit_key: Chave do limite em RENDER_FREE_LIMITS
    """
    if 'error' in data:
        print(f"❌ {label}: Erro - {data['error']}")
        return
    
    percent = data.get('percent', 0)
    level = get_alert_level(percent)
    
    # Escolher emoji baseado no nível
    emoji = {
        'OK': '✅',
        'AVISO': '⚠️',
        'URGENTE': '🔶',
        'CRÍTICO': '🔴'
    }.get(level, '📊')
    
    print(f"\n{emoji} {label}")
    print(f"   Nível: {level}")
    
    for key, value in data.items():
        if key != 'percent':
            print(f"   {key}: {value}")
    
    if limit_key:
        limit = RENDER_FREE_LIMITS.get(limit_key)
        if limit:
            print(f"   Limite: {limit}")
    
    print(f"   Uso: {percent}%")


def generate_report(save_to_file=False):
    """
    Gera relatório completo de uso
    
    Args:
        save_to_file: Se deve guardar relatório em ficheiro
    """
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    print("="*60)
    print(f"📊 RELATÓRIO DE MONITORIZAÇÃO - {timestamp}")
    print("="*60)
    
    # Verificar disco
    disk = check_disk_usage()
    format_alert("Disco Local", disk)
    
    # Verificar base de dados
    db_size = check_database_size()
    format_alert("Base de Dados PostgreSQL", db_size, 'postgres_storage_gb')
    
    # Contar registos
    counts = check_table_counts()
    if 'error' not in counts:
        print(f"\n📈 Contagem de Registos")
        print(f"   Utilizadores: {counts['users']}")
        print(f"   Tarefas: {counts['tasks']}")
    
    # Limites do Render
    print(f"\n📋 Limites do Plano Gratuito (Render)")
    print(f"   Horas mensais: {RENDER_FREE_LIMITS['monthly_hours']}h")
    print(f"   RAM: {RENDER_FREE_LIMITS['ram_mb']}MB")
    print(f"   Largura de banda: {RENDER_FREE_LIMITS['bandwidth_gb']}GB")
    print(f"   PostgreSQL storage: {RENDER_FREE_LIMITS['postgres_storage_gb']}GB")
    
    print("\n" + "="*60)
    
    # Guardar em ficheiro se solicitado
    if save_to_file:
        filename = f"monitoring_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        report_data = {
            'timestamp': timestamp,
            'disk': disk,
            'database': db_size,
            'counts': counts,
            'limits': RENDER_FREE_LIMITS
        }
        
        with open(filename, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        print(f"💾 Relatório guardado em: {filename}")


def main():
    parser = argparse.ArgumentParser(
        description='Monitorizar uso de recursos do Task Manager'
    )
    parser.add_argument(
        '--save',
        action='store_true',
        help='Guardar relatório em ficheiro JSON'
    )
    parser.add_argument(
        '--alert-email',
        help='Email para enviar alertas (não implementado ainda)'
    )
    
    args = parser.parse_args()
    
    if args.alert_email:
        print(f"ℹ️  Envio de emails ainda não implementado")
        print(f"   Email configurado: {args.alert_email}")
    
    generate_report(save_to_file=args.save)


if __name__ == '__main__':
    main()

