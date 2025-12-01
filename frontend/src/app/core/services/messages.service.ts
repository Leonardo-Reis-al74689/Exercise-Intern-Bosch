import { Injectable } from '@angular/core';
import { HttpStatus } from '../enums/http-status.enum';

/**
 * Serviço centralizado para mensagens em português de Portugal
 */
@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  // Mensagens de autenticação
  readonly AUTH = {
    LOGIN_SUCCESS: 'Sessão iniciada com sucesso',
    LOGIN_ERROR: 'Erro ao iniciar sessão. Verifique as suas credenciais.',
    LOGOUT_SUCCESS: 'Sessão terminada com sucesso',
    REGISTER_SUCCESS: 'Conta criada com sucesso',
    REGISTER_ERROR: 'Erro ao criar conta. Tente novamente.',
    UNAUTHORIZED: 'Não autorizado. Por favor, inicie sessão novamente.',
    SESSION_EXPIRED: 'A sua sessão expirou. Por favor, inicie sessão novamente.'
  };

  // Mensagens de tarefas
  readonly TASKS = {
    LOAD_ERROR: 'Erro ao carregar tarefas.',
    CREATE_SUCCESS: 'Tarefa criada com sucesso',
    CREATE_ERROR: 'Erro ao criar tarefa.',
    UPDATE_SUCCESS: 'Tarefa atualizada com sucesso',
    UPDATE_ERROR: 'Erro ao atualizar tarefa.',
    DELETE_SUCCESS: 'Tarefa eliminada com sucesso',
    DELETE_ERROR: 'Erro ao eliminar tarefa.',
    LOAD_TASK_ERROR: 'Erro ao carregar tarefa.',
    NO_TASKS: 'Não tem tarefas ainda. Crie a sua primeira tarefa!',
    LOADING: 'A carregar tarefas...',
    LOADING_TASK: 'A carregar tarefa...',
    DELETING: 'A eliminar...',
    SAVING: 'A guardar...',
    CONFIRM_DELETE: 'Tem a certeza?'
  };

  // Mensagens de validação
  readonly VALIDATION = {
    USERNAME_REQUIRED: 'Nome de utilizador é obrigatório',
    USERNAME_MIN_LENGTH: 'Nome de utilizador deve ter no mínimo 3 caracteres',
    USERNAME_MAX_LENGTH: 'Nome de utilizador deve ter no máximo 80 caracteres',
    EMAIL_REQUIRED: 'Email é obrigatório',
    EMAIL_INVALID: 'Email inválido',
    PASSWORD_REQUIRED: 'Palavra-passe é obrigatória',
    PASSWORD_MIN_LENGTH: 'Palavra-passe deve ter no mínimo 6 caracteres',
    PASSWORD_MISMATCH: 'As palavras-passe não coincidem',
    TITLE_REQUIRED: 'Título é obrigatório',
    TITLE_MAX_LENGTH: 'Título deve ter no máximo 200 caracteres',
    FIELD_REQUIRED: 'Este campo é obrigatório'
  };

  // Mensagens de formulário
  readonly FORMS = {
    LOGIN: 'Iniciar Sessão',
    LOGGING_IN: 'A iniciar sessão...',
    REGISTER: 'Criar Conta',
    REGISTERING: 'A criar conta...',
    CREATE_TASK: 'Nova Tarefa',
    EDIT_TASK: 'Editar Tarefa',
    SAVE: 'Guardar',
    CANCEL: 'Cancelar',
    DELETE: 'Eliminar',
    EDIT: 'Editar',
    YES: 'Sim',
    NO: 'Não',
    SEE_MORE: 'Ver mais',
    NEW_TASK: 'Nova Tarefa',
    FIRST_TASK: 'Criar Primeira Tarefa',
    LOGOUT: 'Sair',
    WELCOME: 'Bem-vindo',
    TASK_MANAGER: 'Gestor de Tarefas',
    NO_ACCOUNT: 'Não tem uma conta?',
    REGISTER_LINK: 'Registe-se',
    TASK_COMPLETED: 'Tarefa concluída',
    CREATED_AT: 'Criada em'
  };

  // Mensagens de erro HTTP
  readonly ERRORS = {
    UNKNOWN: 'Ocorreu um erro desconhecido',
    NETWORK: 'Erro de ligação. Verifique a sua ligação à internet.',
    NOT_FOUND: 'Recurso não encontrado.',
    SERVER_ERROR: 'Erro interno do servidor.',
    BAD_REQUEST: 'Pedido inválido.',
    FORBIDDEN: 'Acesso negado.'
  };

  /**
   * Obtém mensagem de erro HTTP baseada no status
   */
  getHttpErrorMessage(status: number): string {
    switch (status) {
      case HttpStatus.UNAUTHORIZED:
        return this.AUTH.UNAUTHORIZED;
      case HttpStatus.NOT_FOUND:
        return this.ERRORS.NOT_FOUND;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return this.ERRORS.SERVER_ERROR;
      case HttpStatus.BAD_REQUEST:
        return this.ERRORS.BAD_REQUEST;
      case HttpStatus.FORBIDDEN:
        return this.ERRORS.FORBIDDEN;
      default:
        return this.ERRORS.UNKNOWN;
    }
  }
}

