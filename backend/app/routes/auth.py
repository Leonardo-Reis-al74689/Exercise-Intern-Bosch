from flask import Blueprint, request, jsonify
from app.schemas.user import UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.middleware.security_headers import validate_json_content_type
from app.enums.http_status import HTTPStatus
from pydantic import ValidationError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@validate_json_content_type
def register():
    try:
        data = request.get_json()
        user_data = UserCreate(**data)
        
        user = AuthService.register_user(user_data)
        
        return jsonify({
            'message': 'Utilizador criado com sucesso',
            'user': user
        }), HTTPStatus.CREATED.value
        
    except ValidationError as e:
        raise
    except Exception as e:
        raise

@auth_bp.route('/login', methods=['POST'])
@validate_json_content_type
def login():
    try:
        data = request.get_json()
        login_data = UserLogin(**data)
        
        result = AuthService.authenticate_user(login_data)
        
        return jsonify({
            'message': 'Início de sessão realizado com sucesso',
            **result
        }), HTTPStatus.OK.value
        
    except ValidationError as e:
        raise
    except Exception as e:
        raise

