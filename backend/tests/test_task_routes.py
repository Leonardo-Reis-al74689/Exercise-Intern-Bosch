"""Testes para rotas de tarefas"""
import pytest
import json
from unittest.mock import patch

@pytest.mark.integration
@pytest.mark.tasks
class TestTaskRoutes:
    """Testes para as rotas de tarefas"""
    
    def test_list_tasks_success(self, client, auth_headers):
        """Testa listagem de tarefas"""
        task_data = {
            'title': 'Tarefa 1',
            'description': 'Descrição 1',
            'completed': False
        }
        client.post('/api/tasks', json=task_data, headers=auth_headers)
        
        response = client.get('/api/tasks', headers=auth_headers)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert 'tasks' in json_data
        assert 'pagination' in json_data
        assert json_data['pagination']['total'] >= 1
        assert len(json_data['tasks']) >= 1
    
    def test_list_tasks_empty(self, client, auth_headers):
        """Testa listagem quando não há tarefas"""
        response = client.get('/api/tasks', headers=auth_headers)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert 'pagination' in json_data
        assert json_data['pagination']['total'] == 0
        assert len(json_data['tasks']) == 0
    
    def test_list_tasks_unauthorized(self, client):
        """Testa listagem sem autenticação"""
        response = client.get('/api/tasks')
        
        assert response.status_code == 401
    
    def test_create_task_success(self, client, auth_headers):
        """Testa criação de tarefa"""
        task_data = {
            'title': 'Nova tarefa',
            'description': 'Descrição da tarefa',
            'completed': False
        }
        
        response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        
        assert response.status_code == 201
        json_data = response.get_json()
        assert 'task' in json_data
        assert json_data['task']['title'] == 'Nova tarefa'
        assert json_data['task']['completed'] is False
    
    def test_create_task_minimal(self, client, auth_headers):
        """Testa criação de tarefa com dados mínimos"""
        task_data = {
            'title': 'Tarefa simples'
        }
        
        response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        
        assert response.status_code == 201
        json_data = response.get_json()
        assert json_data['task']['title'] == 'Tarefa simples'
        assert json_data['task']['completed'] is False
    
    def test_create_task_invalid_data(self, client, auth_headers):
        """Testa criação com dados inválidos"""
        task_data = {
            'title': ''
        }
        
        response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        
        assert response.status_code == 400
    
    def test_get_task_success(self, client, auth_headers):
        """Testa obtenção de tarefa específica"""
        task_data = {
            'title': 'Tarefa para obter',
            'description': 'Descrição'
        }
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        response = client.get(f'/api/tasks/{task_id}', headers=auth_headers)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['task']['id'] == task_id
        assert json_data['task']['title'] == 'Tarefa para obter'
    
    def test_get_task_not_found(self, client, auth_headers):
        """Testa obtenção de tarefa inexistente"""
        response = client.get('/api/tasks/99999', headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_get_task_unauthorized(self, client, auth_headers):
        """Testa obtenção de tarefa de outro utilizador"""
        task_data = {'title': 'Tarefa privada'}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        user2_data = {
            'username': 'user2',
            'email': 'user2@example.com',
            'password': 'Password123!'
        }
        client.post('/api/auth/register', json=user2_data)
        login_response = client.post('/api/auth/login', json={
            'username': 'user2',
            'password': 'Password123!'
        })
        token2 = login_response.get_json()['access_token']
        headers2 = {'Authorization': f'Bearer {token2}'}
        
        response = client.get(f'/api/tasks/{task_id}', headers=headers2)
        
        assert response.status_code == 403
    
    def test_update_task_success(self, client, auth_headers):
        """Testa atualização de tarefa"""
        task_data = {'title': 'Tarefa original'}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        update_data = {
            'title': 'Tarefa atualizada',
            'completed': True
        }
        
        response = client.put(f'/api/tasks/{task_id}', json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['task']['title'] == 'Tarefa atualizada'
        assert json_data['task']['completed'] is True
    
    def test_update_task_partial(self, client, auth_headers):
        """Testa atualização parcial de tarefa"""
        task_data = {'title': 'Tarefa original', 'completed': False}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        update_data = {'completed': True}
        
        response = client.put(f'/api/tasks/{task_id}', json=update_data, headers=auth_headers)
        
        assert response.status_code == 200
        json_data = response.get_json()
        assert json_data['task']['title'] == 'Tarefa original'
        assert json_data['task']['completed'] is True
    
    def test_update_task_not_found(self, client, auth_headers):
        """Testa atualização de tarefa inexistente"""
        update_data = {'title': 'Tentativa'}
        
        response = client.put('/api/tasks/99999', json=update_data, headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_delete_task_success(self, client, auth_headers):
        """Testa eliminação de tarefa"""
        task_data = {'title': 'Tarefa para eliminar'}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        response = client.delete(f'/api/tasks/{task_id}', headers=auth_headers)
        
        assert response.status_code == 200
        
        get_response = client.get(f'/api/tasks/{task_id}', headers=auth_headers)
        assert get_response.status_code == 404
    
    def test_delete_task_not_found(self, client, auth_headers):
        """Testa eliminação de tarefa inexistente"""
        response = client.delete('/api/tasks/99999', headers=auth_headers)
        
        assert response.status_code == 404
    
    def test_delete_task_unauthorized(self, client, auth_headers):
        """Testa eliminação de tarefa de outro utilizador"""
        task_data = {'title': 'Tarefa privada'}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        user2_data = {
            'username': 'user2',
            'email': 'user2@example.com',
            'password': 'Password123!'
        }
        client.post('/api/auth/register', json=user2_data)
        login_response = client.post('/api/auth/login', json={
            'username': 'user2',
            'password': 'Password123!'
        })
        token2 = login_response.get_json()['access_token']
        headers2 = {'Authorization': f'Bearer {token2}'}
        
        response = client.delete(f'/api/tasks/{task_id}', headers=headers2)
        
        assert response.status_code == 403
    
    def test_list_tasks_exception(self, client, auth_headers, app):
        """Testa tratamento de exceção na listagem de tarefas"""
        with app.app_context():
            with patch('app.routes.tasks.TaskService.get_user_tasks', side_effect=Exception("Error")):
                response = client.get('/api/tasks', headers=auth_headers)
                assert response.status_code in [500, 400]
    
    def test_create_task_validation_error(self, client, auth_headers):
        """Testa tratamento de ValidationError na criação"""
        task_data = {
            'title': None
        }
        
        response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        assert response.status_code == 400
    
    def test_create_task_exception(self, client, auth_headers, app):
        """Testa tratamento de exceção genérica na criação"""
        with app.app_context():
            with patch('app.routes.tasks.TaskService.create_task', side_effect=Exception("Error")):
                task_data = {
                    'title': 'Teste',
                    'description': 'Descrição'
                }
                response = client.post('/api/tasks', json=task_data, headers=auth_headers)
                assert response.status_code in [500, 400]
    
    def test_update_task_validation_error(self, client, auth_headers):
        """Testa tratamento de ValidationError na atualização"""
        task_data = {'title': 'Tarefa original'}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        update_data = {
            'title': None
        }
        
        response = client.put(f'/api/tasks/{task_id}', json=update_data, headers=auth_headers)
        assert response.status_code == 400
    
    def test_update_task_exception(self, client, auth_headers, app):
        """Testa tratamento de exceção genérica na atualização"""
        task_data = {'title': 'Tarefa original'}
        create_response = client.post('/api/tasks', json=task_data, headers=auth_headers)
        task_id = create_response.get_json()['task']['id']
        
        with app.app_context():
            with patch('app.routes.tasks.TaskService.update_task', side_effect=Exception("Error")):
                update_data = {'title': 'Atualizada'}
                response = client.put(f'/api/tasks/{task_id}', json=update_data, headers=auth_headers)
                assert response.status_code in [500, 400]

