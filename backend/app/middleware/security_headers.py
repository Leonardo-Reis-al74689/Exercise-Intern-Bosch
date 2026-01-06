from flask import request, jsonify
from functools import wraps

def setup_security_headers(app):
    @app.after_request
    def add_security_headers(response):
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['X-XSS-Protection'] = '1; mode=block'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Content-Security-Policy'] = "default-src 'self'"
        return response

def validate_json_content_type(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method in ['POST', 'PUT', 'PATCH']:
            if not request.is_json:
                return jsonify({
                    'message': 'Content-Type deve ser application/json',
                    'error_code': 'INVALID_CONTENT_TYPE',
                    'status_code': 400
                }), 400
        return f(*args, **kwargs)
    return decorated_function

