import { TestBed } from '@angular/core/testing';
import { MessagesService } from '../../../app/core/services/messages.service';
import { HttpStatus } from '../../../app/core/enums/http-status.enum';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessagesService);
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('AUTH', () => {
    it('deve ter todas as mensagens de autenticação definidas', () => {
      expect(service.AUTH.LOGIN_SUCCESS).toBeDefined();
      expect(service.AUTH.LOGIN_ERROR).toBeDefined();
      expect(service.AUTH.LOGOUT_SUCCESS).toBeDefined();
      expect(service.AUTH.REGISTER_SUCCESS).toBeDefined();
      expect(service.AUTH.REGISTER_ERROR).toBeDefined();
      expect(service.AUTH.UNAUTHORIZED).toBeDefined();
      expect(service.AUTH.SESSION_EXPIRED).toBeDefined();
    });
  });

  describe('TASKS', () => {
    it('deve ter todas as mensagens de tarefas definidas', () => {
      expect(service.TASKS.LOAD_ERROR).toBeDefined();
      expect(service.TASKS.CREATE_SUCCESS).toBeDefined();
      expect(service.TASKS.CREATE_ERROR).toBeDefined();
      expect(service.TASKS.UPDATE_SUCCESS).toBeDefined();
      expect(service.TASKS.UPDATE_ERROR).toBeDefined();
      expect(service.TASKS.DELETE_SUCCESS).toBeDefined();
      expect(service.TASKS.DELETE_ERROR).toBeDefined();
      expect(service.TASKS.LOAD_TASK_ERROR).toBeDefined();
      expect(service.TASKS.NO_TASKS).toBeDefined();
    });
  });

  describe('VALIDATION', () => {
    it('deve ter todas as mensagens de validação definidas', () => {
      expect(service.VALIDATION.USERNAME_REQUIRED).toBeDefined();
      expect(service.VALIDATION.USERNAME_MIN_LENGTH).toBeDefined();
      expect(service.VALIDATION.USERNAME_MAX_LENGTH).toBeDefined();
      expect(service.VALIDATION.EMAIL_REQUIRED).toBeDefined();
      expect(service.VALIDATION.EMAIL_INVALID).toBeDefined();
      expect(service.VALIDATION.PASSWORD_REQUIRED).toBeDefined();
      expect(service.VALIDATION.PASSWORD_MIN_LENGTH).toBeDefined();
      expect(service.VALIDATION.PASSWORD_MISMATCH).toBeDefined();
      expect(service.VALIDATION.TITLE_REQUIRED).toBeDefined();
      expect(service.VALIDATION.TITLE_MAX_LENGTH).toBeDefined();
    });
  });

  describe('FORMS', () => {
    it('deve ter todas as mensagens de formulário definidas', () => {
      expect(service.FORMS.LOGIN).toBeDefined();
      expect(service.FORMS.REGISTER).toBeDefined();
      expect(service.FORMS.CREATE_TASK).toBeDefined();
      expect(service.FORMS.EDIT_TASK).toBeDefined();
      expect(service.FORMS.SAVE).toBeDefined();
      expect(service.FORMS.CANCEL).toBeDefined();
      expect(service.FORMS.DELETE).toBeDefined();
    });
  });

  describe('ERRORS', () => {
    it('deve ter todas as mensagens de erro definidas', () => {
      expect(service.ERRORS.UNKNOWN).toBeDefined();
      expect(service.ERRORS.NETWORK).toBeDefined();
      expect(service.ERRORS.NOT_FOUND).toBeDefined();
      expect(service.ERRORS.SERVER_ERROR).toBeDefined();
      expect(service.ERRORS.BAD_REQUEST).toBeDefined();
      expect(service.ERRORS.FORBIDDEN).toBeDefined();
    });
  });

  describe('getHttpErrorMessage', () => {
    it('deve retornar mensagem para UNAUTHORIZED', () => {
      const message = service.getHttpErrorMessage(HttpStatus.UNAUTHORIZED);
      expect(message).toBe(service.AUTH.UNAUTHORIZED);
    });

    it('deve retornar mensagem para NOT_FOUND', () => {
      const message = service.getHttpErrorMessage(HttpStatus.NOT_FOUND);
      expect(message).toBe(service.ERRORS.NOT_FOUND);
    });

    it('deve retornar mensagem para INTERNAL_SERVER_ERROR', () => {
      const message = service.getHttpErrorMessage(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(message).toBe(service.ERRORS.SERVER_ERROR);
    });

    it('deve retornar mensagem para BAD_REQUEST', () => {
      const message = service.getHttpErrorMessage(HttpStatus.BAD_REQUEST);
      expect(message).toBe(service.ERRORS.BAD_REQUEST);
    });

    it('deve retornar mensagem para FORBIDDEN', () => {
      const message = service.getHttpErrorMessage(HttpStatus.FORBIDDEN);
      expect(message).toBe(service.ERRORS.FORBIDDEN);
    });

    it('deve retornar mensagem desconhecida para status não mapeado', () => {
      const message = service.getHttpErrorMessage(999);
      expect(message).toBe(service.ERRORS.UNKNOWN);
    });
  });
});

