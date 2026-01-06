"""Testes para rotas de autenticação"""
import pytest
import json

@pytest.mark.integration
@pytest.mark.auth
class TestAuthRoutes:
    """Testes para as rotas de autenticação"""
    
    def test_register_success(self, client):
        """Testa registo bem-sucedido"""
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Password123!'
        }
        
        response = client.post('/api/auth/register', json=data)
        
        assert response.status_code == 201
        json_data = response.get_json()
        assert 'message' in json_data
        assert 'user' in json_data
        assert json_data['user']['username'] == 'newuser'
        assert json_data['user']['email'] == 'newuser@example.com'
    
    def test_register_duplicate_username(self, client):
        """Testa registo com nome de utilizador duplicado"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'Password123!'
        }
        
        client.post('/api/auth/register', json=data)
        
        response = client.post('/api/auth/register', json=data)
        
        assert response.status_code == 409
        json_data = response.get_json()
        assert 'Nome de utilizador' in json_data['message']
    
    def test_register_invalid_data(self, client):
        """Testa registo com dados inválidos"""
        data = {
            'username': 'ab',
            'email': 'invalid-email',
            'password': '123'
        }
        
        response = client.post('/api/auth/register', json=data)
        
        assert response.status_code == 400
    
    def test_register_missing_fields(self, client):
        """Testa registo com campos em falta"""
        data = {
            'username': 'newuser'
        }
        
        response = client.post('/api/auth/register', json=data)
        
        assert response.status_code == 400
    
    def test_register_invalid_content_type(self, client):
        """Testa registo sem Content-Type JSON"""
        data = 'username=newuser&email=test@example.com&password=123456'
        
        response = client.post(
            '/api/auth/register',
            data=data,
            content_type='application/x-www-form-urlencoded'
        )
        
        assert response.status_code == 400
    
    def test_login_success(self, client):
        """Testa início de sessão bem-sucedido"""
        user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPass123!'
        }
        client.post('/api/auth/register', json=user_data)
        
        login_data = {
            'username': 'testuser',
            'password': 'TestPass123!'
        }
        
        response = client.post('/api/auth/login', json=login_data)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert 'access_token' in json_data
        assert 'token_type' in json_data
        assert json_data['token_type'] == 'bearer'
        assert 'user' in json_data
    
    def test_login_invalid_credentials(self, client):
        """Testa início de sessão com credenciais inválidas"""
        login_data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        
        response = client.post('/api/auth/login', json=login_data)
        
        assert response.status_code == 401
        json_data = response.get_json()
        assert 'Credenciais inválidas' in json_data['message']
    
    def test_login_invalid_data(self, client):
        """Testa início de sessão com dados inválidos"""
        login_data = {
            'username': 'testuser'
        }
        
        response = client.post('/api/auth/login', json=login_data)
        
        assert response.status_code == 400

