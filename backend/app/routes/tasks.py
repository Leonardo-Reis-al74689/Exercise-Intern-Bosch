from flask import Blueprint, request, jsonify
from app.schemas.task import TaskCreate, TaskUpdate
from app.services.task_service import TaskService
from app.utils.decorators import require_auth
from app.middleware.security_headers import validate_json_content_type
from app.enums.http_status import HTTPStatus
from pydantic import ValidationError

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('', methods=['GET'])
@require_auth
def list_tasks(current_user):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status', None)
        
        per_page = min(per_page, 100)
        
        result = TaskService.get_user_tasks(current_user, page, per_page, status_filter)
        
        return jsonify({
            'message': 'Tarefas listadas com sucesso',
            'tasks': [task.to_dict() for task in result['tasks']],
            'pagination': {
                'total': result['total'],
                'page': result['page'],
                'per_page': result['per_page'],
                'pages': result['pages'],
                'has_next': result['has_next'],
                'has_prev': result['has_prev']
            }
        }), HTTPStatus.OK.value
    except Exception as e:
        raise

@tasks_bp.route('', methods=['POST'])
@require_auth
@validate_json_content_type
def create_task(current_user):
    try:
        data = request.get_json()
        task_data = TaskCreate(**data)
        
        new_task = TaskService.create_task(task_data, current_user)
        
        return jsonify({
            'message': 'Tarefa criada com sucesso',
            'task': new_task.to_dict()
        }), HTTPStatus.CREATED.value
        
    except ValidationError as e:
        raise
    except Exception as e:
        raise

@tasks_bp.route('/<int:task_id>', methods=['GET'])
@require_auth
def get_task(current_user, task_id):
    try:
        task = TaskService.get_task_by_id(task_id, current_user)
        
        return jsonify({
            'message': 'Tarefa encontrada',
            'task': task.to_dict()
        }), HTTPStatus.OK.value
    except Exception as e:
        raise

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@require_auth
@validate_json_content_type
def update_task(current_user, task_id):
    try:
        data = request.get_json()
        task_data = TaskUpdate(**data)
        
        updated_task = TaskService.update_task(task_id, task_data, current_user)
        
        return jsonify({
            'message': 'Tarefa atualizada com sucesso',
            'task': updated_task.to_dict()
        }), HTTPStatus.OK.value
        
    except ValidationError as e:
        raise
    except Exception as e:
        raise

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@require_auth
def delete_task(current_user, task_id):
    try:
        TaskService.delete_task(task_id, current_user)
        
        return jsonify({
            'message': 'Tarefa eliminada com sucesso'
        }), HTTPStatus.OK.value
    except Exception as e:
        raise

