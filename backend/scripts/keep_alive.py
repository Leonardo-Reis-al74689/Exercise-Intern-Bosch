#!/usr/bin/env python
"""
Script Keep-Alive para manter o serviço Render ativo
Evita o "cold start" fazendo requests regulares ao backend

Este script é executado automaticamente via GitHub Actions a cada 14 minutos
NÃO precisa ser executado manualmente

Uso manual (se necessário):
    python scripts/keep_alive.py
    python scripts/keep_alive.py --url https://seu-backend.onrender.com
"""
import os
import sys
import requests
import time
from datetime import datetime
import argparse


# URL padrão do backend (atualizar após deploy)
DEFAULT_BACKEND_URL = os.getenv('BACKEND_URL', 'https://taskmanager-backend.onrender.com')


def ping_service(url, timeout=30):
    """
    Faz um request ao endpoint de health check
    
    Args:
        url: URL base do backend
        timeout: Timeout em segundos
        
    Returns:
        bool: True se sucesso, False caso contrário
    """
    health_url = f"{url.rstrip('/')}/health"
    
    try:
        print(f"🔄 A verificar serviço em: {health_url}")
        
        response = requests.get(health_url, timeout=timeout)
        
        if response.status_code == 200:
            data = response.json()
            status = data.get('status', 'unknown')
            database = data.get('database', 'unknown')
            
            print(f"✅ Serviço operacional!")
            print(f"   - Status: {status}")
            print(f"   - Base de dados: {database}")
            print(f"   - Tempo de resposta: {response.elapsed.total_seconds():.2f}s")
            
            return True
        else:
            print(f"⚠️  Resposta inesperada: {response.status_code}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"⏱️  Timeout após {timeout}s (serviço pode estar a acordar)")
        return False
    except requests.exceptions.ConnectionError as e:
        print(f"❌ Erro de conexão: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False


def keep_alive_loop(url, interval_minutes=14, max_iterations=None):
    """
    Loop contínuo de keep-alive
    
    Args:
        url: URL do backend
        interval_minutes: Intervalo entre pings em minutos
        max_iterations: Número máximo de iterações (None = infinito)
    """
    iteration = 0
    
    print(f"🚀 Keep-Alive iniciado")
    print(f"   - URL: {url}")
    print(f"   - Intervalo: {interval_minutes} minutos")
    print(f"   - Iterações: {'∞' if max_iterations is None else max_iterations}")
    print()
    
    while True:
        iteration += 1
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        print(f"\n{'='*60}")
        print(f"Iteração #{iteration} - {timestamp}")
        print(f"{'='*60}")
        
        success = ping_service(url)
        
        if max_iterations and iteration >= max_iterations:
            print(f"\n✅ Atingido número máximo de iterações ({max_iterations})")
            break
        
        # Aguardar próximo ping
        sleep_seconds = interval_minutes * 60
        print(f"\n💤 A aguardar {interval_minutes} minutos até próximo ping...")
        time.sleep(sleep_seconds)


def main():
    parser = argparse.ArgumentParser(
        description='Keep-Alive para manter serviço Render acordado'
    )
    parser.add_argument(
        '--url',
        default=DEFAULT_BACKEND_URL,
        help='URL do backend (padrão: variável BACKEND_URL ou valor hardcoded)'
    )
    parser.add_argument(
        '--interval',
        type=int,
        default=14,
        help='Intervalo entre pings em minutos (padrão: 14)'
    )
    parser.add_argument(
        '--once',
        action='store_true',
        help='Executar apenas uma vez (sem loop)'
    )
    parser.add_argument(
        '--iterations',
        type=int,
        default=None,
        help='Número máximo de iterações (padrão: infinito)'
    )
    
    args = parser.parse_args()
    
    # Validar URL
    if not args.url.startswith(('http://', 'https://')):
        print("❌ Erro: URL deve começar com http:// ou https://")
        sys.exit(1)
    
    # Executar
    if args.once:
        # Ping único
        success = ping_service(args.url)
        sys.exit(0 if success else 1)
    else:
        # Loop contínuo
        try:
            keep_alive_loop(
                url=args.url,
                interval_minutes=args.interval,
                max_iterations=args.iterations
            )
        except KeyboardInterrupt:
            print("\n\n⏹️  Keep-Alive interrompido pelo utilizador")
            sys.exit(0)


if __name__ == '__main__':
    main()

