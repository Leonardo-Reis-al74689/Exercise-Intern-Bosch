import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { LoginComponent } from '../../../app/components/login/login.component';
import { AuthService } from '../../../app/services/auth.service';
import { MessagesService } from '../../../app/core/services/messages.service';
import { ValidationRules } from '../../../app/core/enums/validation-rules.enum';
import { LoginResponse, User } from '../../../app/models/user.model';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;
  let messagesService: jasmine.SpyObj<MessagesService>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  };

  const mockLoginResponse: LoginResponse = {
    access_token: 'mock-token',
    token_type: 'Bearer',
    user: mockUser
  };

  beforeEach(async () => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['login', 'setAuthData']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', [], {
      AUTH: {
        LOGIN_ERROR: 'Erro ao iniciar sessão'
      },
      FORMS: {
        TASK_MANAGER: 'Gestor de Tarefas',
        LOGIN: 'Iniciar Sessão',
        LOGGING_IN: 'A iniciar sessão...',
        NO_ACCOUNT: 'Não tem uma conta?',
        REGISTER_LINK: 'Registe-se'
      },
      VALIDATION: {
        USERNAME_REQUIRED: 'Nome de utilizador é obrigatório',
        USERNAME_MIN_LENGTH: 'Nome de utilizador deve ter no mínimo 3 caracteres',
        PASSWORD_REQUIRED: 'Palavra-passe é obrigatória',
        PASSWORD_MIN_LENGTH: 'Palavra-passe deve ter no mínimo 6 caracteres'
      }
    });

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Formulário', () => {
    it('deve criar o formulário com campos vazios', () => {
      expect(component.loginForm).toBeDefined();
      expect(component.loginForm.get('username')?.value).toBe('');
      expect(component.loginForm.get('password')?.value).toBe('');
    });

    it('deve ter validações obrigatórias para username', () => {
      const usernameControl = component.loginForm.get('username');
      expect(usernameControl?.hasError('required')).toBeTrue();
    });

    it('deve ter validação de comprimento mínimo para username', () => {
      const usernameControl = component.loginForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBeTrue();
    });

    it('deve aceitar username válido', () => {
      const usernameControl = component.loginForm.get('username');
      usernameControl?.setValue('testuser');
      expect(usernameControl?.valid).toBeTrue();
    });

    it('deve ter validações obrigatórias para password', () => {
      const passwordControl = component.loginForm.get('password');
      expect(passwordControl?.hasError('required')).toBeTrue();
    });

    it('deve ter validação de comprimento mínimo para password', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('12345');
      expect(passwordControl?.hasError('minlength')).toBeTrue();
    });

    it('deve aceitar password válido', () => {
      const passwordControl = component.loginForm.get('password');
      passwordControl?.setValue('password123');
      expect(passwordControl?.valid).toBeTrue();
    });
  });

  describe('onSubmit', () => {
    it('não deve fazer nada se o formulário for inválido', () => {
      component.loginForm.patchValue({
        username: '',
        password: ''
      });

      component.onSubmit();

      expect(authService.login).not.toHaveBeenCalled();
    });

    it('deve chamar authService.login quando o formulário for válido', () => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('deve definir isLoading como true durante o login', () => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading).toBeTrue();
    });

    it('deve chamar setAuthData e navegar para /tasks em caso de sucesso', () => {
      authService.login.and.returnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();

      expect(authService.setAuthData).toHaveBeenCalledWith(mockLoginResponse);
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('deve definir errorMessage em caso de erro', () => {
      const errorMessage = 'Credenciais inválidas';
      authService.login.and.returnValue(throwError(() => new Error(errorMessage)));

      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpassword'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });

    it('deve usar mensagem padrão quando erro não tem mensagem', () => {
      authService.login.and.returnValue(throwError(() => new Error('')));

      component.loginForm.patchValue({
        username: 'testuser',
        password: 'wrongpassword'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(messagesService.AUTH.LOGIN_ERROR);
    });

    it('deve limpar errorMessage antes de tentar login', () => {
      component.errorMessage = 'Erro anterior';
      authService.login.and.returnValue(of(mockLoginResponse));

      component.loginForm.patchValue({
        username: 'testuser',
        password: 'password123'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('messages', () => {
    it('deve retornar messagesService', () => {
      expect(component.messages).toBe(messagesService);
    });
  });
});

