"""Testes para AuthService"""
import pytest
from unittest.mock import patch
from app.services.auth_service import AuthService
from app.schemas.user import UserCreate, UserLogin
from app.exceptions.custom_exceptions import (
    ResourceAlreadyExistsException,
    AuthenticationException,
    ResourceNotFoundException,
    DatabaseException
)
from app import db
from app.models.user import User

@pytest.mark.unit
@pytest.mark.auth
class TestAuthService:
    """Testes para o serviço de autenticação"""
    
    def test_register_user_success(self, app):
        """Testa registo bem-sucedido de utilizador"""
        with app.app_context():
            user_data = UserCreate(
                username='newuser',
                email='newuser@example.com',
                password='Password123!'
            )
            
            result = AuthService.register_user(user_data)
            
            assert result['username'] == 'newuser'
            assert result['email'] == 'newuser@example.com'
            assert 'id' in result
            
            user = User.query.filter_by(username='newuser').first()
            assert user is not None
            assert user.email == 'newuser@example.com'
    
    def test_register_user_duplicate_username(self, app, test_user):
        """Testa registo com nome de utilizador duplicado"""
        with app.app_context():
            user_data = UserCreate(
                username='testuser',
                email='different@example.com',
                password='Password123!'
            )
            
            with pytest.raises(ResourceAlreadyExistsException) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'Nome de utilizador' in str(exc_info.value.message)
    
    def test_register_user_duplicate_email(self, app, test_user):
        """Testa registo com email duplicado"""
        with app.app_context():
            user_data = UserCreate(
                username='differentuser',
                email='test@example.com',
                password='Password123!'
            )
            
            with pytest.raises(ResourceAlreadyExistsException) as exc_info:
                AuthService.register_user(user_data)
            
            assert 'Email' in str(exc_info.value.message)
    
    def test_authenticate_user_success(self, app, test_user):
        """Testa autenticação bem-sucedida"""
        with app.app_context():
            login_data = UserLogin(
                username='testuser',
                password='TestPass123!'
            )
            
            result = AuthService.authenticate_user(login_data)
            
            assert 'access_token' in result
            assert 'token_type' in result
            assert result['token_type'] == 'bearer'
            assert 'user' in result
            assert result['user']['username'] == 'testuser'
    
    def test_authenticate_user_invalid_username(self, app):
        """Testa autenticação com nome de utilizador inválido"""
        with app.app_context():
            login_data = UserLogin(
                username='nonexistent',
                password='password123'
            )
            
            with pytest.raises(AuthenticationException) as exc_info:
                AuthService.authenticate_user(login_data)
            
            assert 'Credenciais inválidas' in str(exc_info.value.message)
    
    def test_authenticate_user_invalid_password(self, app, test_user):
        """Testa autenticação com palavra-passe inválida"""
        with app.app_context():
            login_data = UserLogin(
                username='testuser',
                password='wrongpassword'
            )
            
            with pytest.raises(AuthenticationException) as exc_info:
                AuthService.authenticate_user(login_data)
            
            assert 'Credenciais inválidas' in str(exc_info.value.message)
    
    def test_get_user_by_id_success(self, app, test_user):
        """Testa obtenção de utilizador por ID"""
        with app.app_context():
            user = AuthService.get_user_by_id(test_user.id)
            
            assert user.id == test_user.id
            assert user.username == 'testuser'
    
    def test_get_user_by_id_not_found(self, app):
        """Testa obtenção de utilizador inexistente"""
        with app.app_context():
            with pytest.raises(ResourceNotFoundException) as exc_info:
                AuthService.get_user_by_id(99999)
            
            assert 'Utilizador' in str(exc_info.value.message)
    
    def test_register_user_database_exception(self, app):
        """Testa DatabaseException ao registar utilizador"""
        with app.app_context():
            user_data = UserCreate(
                username='newuser',
                email='newuser@example.com',
                password='Password123!'
            )
            
            with patch('app.db.session.commit', side_effect=Exception("DB Error")):
                with pytest.raises(DatabaseException) as exc_info:
                    AuthService.register_user(user_data)
                
                assert 'Erro ao criar utilizador' in str(exc_info.value.message)

