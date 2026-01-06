from app import db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import verify_password, get_password_hash
from app.utils.login_attempts import login_tracker
from app.exceptions.custom_exceptions import (
    AuthenticationException,
    ResourceAlreadyExistsException,
    DatabaseException
)
from flask_jwt_extended import create_access_token

class AuthService:
    """Classe de serviço para operações de autenticação"""
    
    @staticmethod
    def register_user(user_data: UserCreate) -> dict:
        """
        Regista um novo utilizador no sistema
        
        Args:
            user_data: Dados do utilizador para registo
            
        Returns:
            dict: Dados do utilizador criado
            
        Raises:
            ResourceAlreadyExistsException: Se utilizador ou email já existir
            DatabaseException: Se houver erro ao guardar na base de dados
        """
        existing_user = User.query.filter_by(username=user_data.username).first()
        if existing_user:
            raise ResourceAlreadyExistsException(
                resource="Nome de utilizador",
                details={"username": user_data.username}
            )
        
        existing_email = User.query.filter_by(email=user_data.email).first()
        if existing_email:
            raise ResourceAlreadyExistsException(
                resource="Email",
                details={"email": user_data.email}
            )
        
        try:
            new_user = User(
                username=user_data.username,
                email=user_data.email,
                hashed_password=get_password_hash(user_data.password)
            )
            db.session.add(new_user)
            db.session.commit()
            
            return new_user.to_dict()
        except Exception as e:
            db.session.rollback()
            raise DatabaseException(
                message="Erro ao criar utilizador na base de dados",
                details={"error": str(e)}
            )
    
    @staticmethod
    def authenticate_user(login_data: UserLogin) -> dict:
        if login_tracker.is_blocked(login_data.username):
            block_time = login_tracker.get_block_time_remaining(login_data.username)
            raise AuthenticationException(
                message=f"Conta bloqueada temporariamente. Tente novamente em {block_time} minutos",
                details={"username": login_data.username, "blocked_minutes": block_time}
            )
        
        user = User.query.filter_by(username=login_data.username).first()
        
        if not user or not verify_password(login_data.password, user.hashed_password):
            login_tracker.record_failed_attempt(login_data.username)
            remaining = login_tracker.get_remaining_attempts(login_data.username)
            
            if remaining > 0:
                raise AuthenticationException(
                    message=f"Credenciais inválidas. Tentativas restantes: {remaining}",
                    details={"username": login_data.username, "remaining_attempts": remaining}
                )
            else:
                raise AuthenticationException(
                    message="Demasiadas tentativas falhadas. Conta bloqueada por 15 minutos",
                    details={"username": login_data.username}
                )
        
        login_tracker.record_successful_login(login_data.username)
        
        access_token = create_access_token(identity=user.id)
        
        return {
            'access_token': access_token,
            'token_type': 'bearer',
            'user': user.to_dict()
        }
    
    @staticmethod
    def get_user_by_id(user_id: int) -> User:
        """
        Busca utilizador por ID
        
        Args:
            user_id: ID do utilizador
            
        Returns:
            User: Objeto do utilizador
            
        Raises:
            ResourceNotFoundException: Se utilizador não for encontrado
        """
        from app.exceptions.custom_exceptions import ResourceNotFoundException
        
        user = User.query.get(user_id)
        if not user:
            raise ResourceNotFoundException(
                resource="Utilizador",
                details={"user_id": user_id}
            )
        return user

