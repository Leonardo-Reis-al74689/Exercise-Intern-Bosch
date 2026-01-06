"""Testes para TaskService"""
import pytest
from unittest.mock import patch, MagicMock
from app.services.task_service import TaskService
from app.schemas.task import TaskCreate, TaskUpdate
from app.exceptions.custom_exceptions import (
    ResourceNotFoundException,
    AuthorizationException,
    DatabaseException
)
from app import db
from app.models.task import Task

@pytest.mark.unit
@pytest.mark.tasks
class TestTaskService:
    """Testes para o serviço de tarefas"""
    
    def test_get_user_tasks(self, app, test_user):
        """Testa obtenção de tarefas do utilizador"""
        with app.app_context():
            task1 = Task(title='Tarefa 1', user_id=test_user.id)
            task2 = Task(title='Tarefa 2', user_id=test_user.id)
            db.session.add_all([task1, task2])
            db.session.commit()
            
            result = TaskService.get_user_tasks(test_user)
            
            assert isinstance(result, dict)
            assert 'tasks' in result
            assert 'pagination' in result or 'total' in result
            assert len(result['tasks']) == 2
            assert all(task.user_id == test_user.id for task in result['tasks'])
    
    def test_get_task_by_id_success(self, app, test_user, test_task):
        """Testa obtenção de tarefa específica"""
        with app.app_context():
            task = TaskService.get_task_by_id(test_task.id, test_user)
            
            assert task.id == test_task.id
            assert task.title == 'Tarefa de teste'
    
    def test_get_task_by_id_not_found(self, app, test_user):
        """Testa obtenção de tarefa inexistente"""
        with app.app_context():
            with pytest.raises(ResourceNotFoundException) as exc_info:
                TaskService.get_task_by_id(99999, test_user)
            
            assert 'Tarefa' in str(exc_info.value.message)
    
    def test_get_task_by_id_unauthorized(self, app, test_user, another_user):
        """Testa obtenção de tarefa de outro utilizador"""
        with app.app_context():
            task = Task(title='Tarefa privada', user_id=test_user.id)
            db.session.add(task)
            db.session.commit()
            
            with pytest.raises(AuthorizationException) as exc_info:
                TaskService.get_task_by_id(task.id, another_user)
            
            assert 'permissão' in str(exc_info.value.message).lower()
    
    def test_create_task_success(self, app, test_user):
        """Testa criação de tarefa"""
        with app.app_context():
            task_data = TaskCreate(
                title='Nova tarefa',
                description='Descrição',
                completed=False
            )
            
            task = TaskService.create_task(task_data, test_user)
            
            assert task.id is not None
            assert task.title == 'Nova tarefa'
            assert task.user_id == test_user.id
            assert task.completed is False
    
    def test_update_task_success(self, app, test_user, test_task):
        """Testa atualização de tarefa"""
        with app.app_context():
            task_data = TaskUpdate(
                title='Tarefa atualizada',
                completed=True
            )
            
            updated_task = TaskService.update_task(test_task.id, task_data, test_user)
            
            assert updated_task.title == 'Tarefa atualizada'
            assert updated_task.completed is True
            assert updated_task.id == test_task.id
    
    def test_update_task_partial(self, app, test_user, test_task):
        """Testa atualização parcial de tarefa"""
        with app.app_context():
            original_title = test_task.title
            task_data = TaskUpdate(completed=True)
            
            updated_task = TaskService.update_task(test_task.id, task_data, test_user)
            
            assert updated_task.title == original_title
            assert updated_task.completed is True
    
    def test_update_task_unauthorized(self, app, test_user, another_user):
        """Testa atualização de tarefa de outro utilizador"""
        with app.app_context():
            task = Task(title='Tarefa privada', user_id=test_user.id)
            db.session.add(task)
            db.session.commit()
            
            task_data = TaskUpdate(title='Tentativa de alteração')
            
            with pytest.raises(AuthorizationException):
                TaskService.update_task(task.id, task_data, another_user)
    
    def test_delete_task_success(self, app, test_user, test_task):
        """Testa eliminação de tarefa"""
        with app.app_context():
            task_id = test_task.id
            TaskService.delete_task(task_id, test_user)
            
            task = Task.query.get(task_id)
            assert task is None
    
    def test_delete_task_unauthorized(self, app, test_user, another_user):
        """Testa eliminação de tarefa de outro utilizador"""
        with app.app_context():
            task = Task(title='Tarefa privada', user_id=test_user.id)
            db.session.add(task)
            db.session.commit()
            
            with pytest.raises(AuthorizationException):
                TaskService.delete_task(task.id, another_user)
    
    def test_create_task_database_exception(self, app, test_user):
        """Testa DatabaseException ao criar tarefa"""
        with app.app_context():
            task_data = TaskCreate(
                title='Nova tarefa',
                description='Descrição',
                completed=False
            )
            
            with patch('app.db.session.commit', side_effect=Exception("DB Error")):
                with pytest.raises(DatabaseException) as exc_info:
                    TaskService.create_task(task_data, test_user)
                
                assert 'Erro ao criar tarefa' in str(exc_info.value.message)
    
    def test_update_task_description(self, app, test_user, test_task):
        """Testa atualização de descrição da tarefa"""
        with app.app_context():
            task_data = TaskUpdate(description='Nova descrição')
            
            updated_task = TaskService.update_task(test_task.id, task_data, test_user)
            
            assert updated_task.description == 'Nova descrição'
    
    def test_update_task_database_exception(self, app, test_user, test_task):
        """Testa DatabaseException ao atualizar tarefa"""
        with app.app_context():
            task_data = TaskUpdate(title='Tarefa atualizada')
            
            with patch('app.db.session.commit', side_effect=Exception("DB Error")):
                with pytest.raises(DatabaseException) as exc_info:
                    TaskService.update_task(test_task.id, task_data, test_user)
                
                assert 'Erro ao atualizar tarefa' in str(exc_info.value.message)
    
    def test_delete_task_database_exception(self, app, test_user, test_task):
        """Testa DatabaseException ao eliminar tarefa"""
        with app.app_context():
            with patch('app.db.session.commit', side_effect=Exception("DB Error")):
                with pytest.raises(DatabaseException) as exc_info:
                    TaskService.delete_task(test_task.id, test_user)
                
                assert 'Erro ao eliminar tarefa' in str(exc_info.value.message)

