"""Configuração e fixtures para testes"""
import pytest
from app import create_app, db
from app.models.user import User
from app.models.task import Task
from app.utils.security import get_password_hash
from config import Config

class TestConfig(Config):
    """Configuração para testes"""
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    JWT_SECRET_KEY = 'test-jwt-secret-key'
    SECRET_KEY = 'test-secret-key'
    WTF_CSRF_ENABLED = False

@pytest.fixture
def app():
    """Cria uma instância da aplicação para testes"""
    app = create_app(TestConfig)
    
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    """Cliente de teste para fazer requisições HTTP"""
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    """Cria um utilizador e retorna headers de autenticação"""
    user_data = {
        'username': 'testuser',
        'email': 'test@example.com',
        'password': 'TestPass123!'
    }
    
    client.post('/api/auth/register', json=user_data)
    
    response = client.post('/api/auth/login', json={
        'username': 'testuser',
        'password': 'TestPass123!'
    })
    
    token = response.get_json()['access_token']
    
    return {'Authorization': f'Bearer {token}'}

@pytest.fixture
def test_user(app):
    """Cria um utilizador de teste na base de dados"""
    with app.app_context():
        user = User(
            username='testuser',
            email='test@example.com',
            hashed_password=get_password_hash('TestPass123!')
        )
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user

@pytest.fixture
def test_task(app, test_user):
    """Cria uma tarefa de teste na base de dados"""
    with app.app_context():
        task = Task(
            title='Tarefa de teste',
            description='Descrição da tarefa de teste',
            completed=False,
            user_id=test_user.id
        )
        db.session.add(task)
        db.session.commit()
        db.session.refresh(task)
        return task

@pytest.fixture
def another_user(app):
    """Cria outro utilizador de teste"""
    with app.app_context():
        user = User(
            username='anotheruser',
            email='another@example.com',
            hashed_password=get_password_hash('AnotherPass123!')
        )
        db.session.add(user)
        db.session.commit()
        db.session.refresh(user)
        return user

