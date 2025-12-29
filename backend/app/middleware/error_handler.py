"""Handler de exceções customizadas"""
from flask import jsonify
from app.exceptions.custom_exceptions import AppException
from app.enums.error_codes import ErrorCode
from app.enums.http_status import HTTPStatus
from pydantic import ValidationError

def register_error_handlers(app):
    """Regista handlers de exceções na aplicação Flask"""
    
    @app.errorhandler(AppException)
    def handle_app_exception(e: AppException):
        """Handler para exceções customizadas da aplicação"""
        return jsonify(e.to_dict()), e.status_code.value
    
    @app.errorhandler(ValidationError)
    def handle_validation_error(e: ValidationError):
        """Handler para erros de validação do Pydantic"""
        errors = []
        for error in e.errors():
            errors.append({
                'loc': list(error.get('loc', [])),
                'msg': str(error.get('msg', '')),
                'type': str(error.get('type', ''))
            })
        
        return jsonify({
            'message': 'Dados inválidos',
            'error_code': ErrorCode.VALIDATION_ERROR.value,
            'status_code': HTTPStatus.BAD_REQUEST.value,
            'details': {'validation_errors': errors}
        }), HTTPStatus.BAD_REQUEST.value
    
    @app.errorhandler(404)
    def handle_not_found(e):
        """Handler para rotas não encontradas"""
        return jsonify({
            'message': 'Rota não encontrada',
            'error_code': ErrorCode.RESOURCE_NOT_FOUND.value,
            'status_code': HTTPStatus.NOT_FOUND.value
        }), HTTPStatus.NOT_FOUND.value
    
    @app.errorhandler(500)
    def handle_internal_error(e):
        """Handler para erros internos do servidor"""
        return jsonify({
            'message': 'Erro interno do servidor',
            'error_code': ErrorCode.INTERNAL_SERVER_ERROR.value,
            'status_code': HTTPStatus.INTERNAL_SERVER_ERROR.value
        }), HTTPStatus.INTERNAL_SERVER_ERROR.value
    
    @app.errorhandler(Exception)
    def handle_generic_exception(e: Exception):
        """Handler para exceções genéricas não tratadas"""
        import traceback
        import os
        
        # Log do erro completo no console
        app.logger.error(f"Exceção não tratada: {str(e)}")
        app.logger.error(traceback.format_exc())
        
        # Em desenvolvimento, mostrar detalhes do erro
        response_data = {
            'message': 'Erro interno do servidor',
            'error_code': ErrorCode.INTERNAL_SERVER_ERROR.value,
            'status_code': HTTPStatus.INTERNAL_SERVER_ERROR.value
        }
        
        # Adicionar detalhes em modo de desenvolvimento/debug
        if os.getenv('FLASK_ENV') != 'production':
            response_data['details'] = {
                'error': str(e),
                'type': type(e).__name__
            }
        
        return jsonify(response_data), HTTPStatus.INTERNAL_SERVER_ERROR.value

