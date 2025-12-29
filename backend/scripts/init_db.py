#!/usr/bin/env python
"""
Script de inicialização da base de dados
Cria tabelas e opcionalmente adiciona dados de teste

Uso:
    python scripts/init_db.py
    python scripts/init_db.py --seed  # Com dados de exemplo
"""
import os
import sys

# Adicionar diretório pai ao path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

from app import create_app, db
from app.models.user import User
from app.models.task import Task
from app.enums.task_status import TaskStatus
import argparse


def init_database(seed_data=False):
    """Inicializa a base de dados"""
    app = create_app()
    
    with app.app_context():
        print("🔧 A inicializar base de dados...")
        
        try:
            # Criar todas as tabelas
            db.create_all()
            print("✅ Tabelas criadas com sucesso!")
            
            # Verificar se já existem dados
            user_count = User.query.count()
            task_count = Task.query.count()
            
            print(f"📊 Estado atual:")
            print(f"   - Utilizadores: {user_count}")
            print(f"   - Tarefas: {task_count}")
            
            # Adicionar dados de teste se solicitado
            if seed_data and user_count == 0:
                print("\n🌱 A adicionar dados de exemplo...")
                seed_database()
                print("✅ Dados de exemplo adicionados!")
            
            print("\n✨ Base de dados pronta para uso!")
            
        except Exception as e:
            print(f"❌ Erro ao inicializar base de dados: {e}")
            sys.exit(1)


def seed_database():
    """Adiciona dados de exemplo à base de dados"""
    # Criar utilizador de teste
    test_user = User(
        username="demo",
        email="demo@taskmanager.com"
    )
    test_user.set_password("Demo123!")
    db.session.add(test_user)
    db.session.commit()
    
    # Criar tarefas de exemplo
    tasks = [
        Task(
            title="Configurar ambiente de desenvolvimento",
            description="Instalar Docker e configurar docker-compose",
            status=TaskStatus.COMPLETED,
            user_id=test_user.id
        ),
        Task(
            title="Implementar autenticação JWT",
            description="Criar endpoints de login e registo com tokens JWT",
            status=TaskStatus.COMPLETED,
            user_id=test_user.id
        ),
        Task(
            title="Fazer deploy no Render",
            description="Configurar deploy automático do backend",
            status=TaskStatus.IN_PROGRESS,
            user_id=test_user.id
        ),
        Task(
            title="Fazer deploy no Vercel",
            description="Configurar deploy automático do frontend",
            status=TaskStatus.PENDING,
            user_id=test_user.id
        ),
        Task(
            title="Documentar API",
            description="Criar documentação completa dos endpoints",
            status=TaskStatus.PENDING,
            user_id=test_user.id
        )
    ]
    
    for task in tasks:
        db.session.add(task)
    
    db.session.commit()
    
    print(f"   ✅ Criado utilizador: {test_user.username}")
    print(f"   ✅ Criadas {len(tasks)} tarefas de exemplo")


def drop_all_tables():
    """Remove todas as tabelas (CUIDADO!)"""
    app = create_app()
    
    with app.app_context():
        print("⚠️  A remover todas as tabelas...")
        response = input("Tem a certeza? Esta ação é irreversível! (sim/não): ")
        
        if response.lower() == 'sim':
            db.drop_all()
            print("✅ Todas as tabelas removidas!")
        else:
            print("❌ Operação cancelada")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Inicializar base de dados do Task Manager'
    )
    parser.add_argument(
        '--seed',
        action='store_true',
        help='Adicionar dados de exemplo'
    )
    parser.add_argument(
        '--drop',
        action='store_true',
        help='Remover todas as tabelas (CUIDADO!)'
    )
    
    args = parser.parse_args()
    
    if args.drop:
        drop_all_tables()
    else:
        init_database(seed_data=args.seed)

