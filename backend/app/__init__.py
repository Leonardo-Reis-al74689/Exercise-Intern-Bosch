from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

import sys
import os
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class=Config):
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    db.init_app(app)
    jwt.init_app(app)
    
    CORS(app, 
         origins=app.config.get('CORS_ORIGINS', ['http://localhost:4200']),
         methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
         allow_headers=['Content-Type', 'Authorization'],
         supports_credentials=True)
    
    from app.middleware.security_headers import setup_security_headers
    setup_security_headers(app)
    
    if app.config.get('RATELIMIT_ENABLED', False):
        from app.middleware.rate_limiter import setup_rate_limiter
        setup_rate_limiter(app)
    
    from app.middleware.error_handler import register_error_handlers
    register_error_handlers(app)
    
    from app.routes.auth import auth_bp
    from app.routes.tasks import tasks_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
    
    # Endpoint de health check para monitorização
    @app.route('/health')
    def health_check():
        """Verifica se a aplicação e BD estão operacionais"""
        try:
            # Testa conexão à base de dados
            db.session.execute(db.text('SELECT 1'))
            return {
                'status': 'healthy',
                'database': 'connected',
                'message': 'API operacional'
            }, 200
        except Exception as e:
            return {
                'status': 'unhealthy',
                'database': 'disconnected',
                'error': str(e)
            }, 503
    
    with app.app_context():
        db.create_all()
    
    return app

