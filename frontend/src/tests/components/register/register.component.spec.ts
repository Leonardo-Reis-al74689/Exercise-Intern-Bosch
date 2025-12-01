import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from '../../../app/components/register/register.component';
import { AuthService } from '../../../app/services/auth.service';
import { MessagesService } from '../../../app/core/services/messages.service';
import { ValidationRules } from '../../../app/core/enums/validation-rules.enum';
import { LoginResponse, User } from '../../../app/models/user.model';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
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
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['register', 'login', 'setAuthData']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', [], {
      AUTH: {
        REGISTER_ERROR: 'Erro ao criar conta',
        LOGIN_ERROR: 'Erro ao iniciar sessão'
      },
      FORMS: {
        TASK_MANAGER: 'Gestor de Tarefas',
        REGISTER: 'Criar Conta',
        LOGIN: 'Iniciar Sessão'
      },
      VALIDATION: {
        USERNAME_REQUIRED: 'Nome de utilizador é obrigatório',
        USERNAME_MIN_LENGTH: 'Nome de utilizador deve ter no mínimo 3 caracteres',
        USERNAME_MAX_LENGTH: 'Nome de utilizador deve ter no máximo 80 caracteres',
        EMAIL_INVALID: 'Email inválido',
        PASSWORD_REQUIRED: 'Palavra-passe é obrigatória',
        PASSWORD_MIN_LENGTH: 'Palavra-passe deve ter no mínimo 6 caracteres',
        PASSWORD_MISMATCH: 'As palavras-passe não coincidem',
        FIELD_REQUIRED: 'Este campo é obrigatório'
      }
    });

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
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
      expect(component.registerForm).toBeDefined();
      expect(component.registerForm.get('username')?.value).toBe('');
      expect(component.registerForm.get('email')?.value).toBe('');
      expect(component.registerForm.get('password')?.value).toBe('');
      expect(component.registerForm.get('confirmPassword')?.value).toBe('');
    });

    it('deve ter validações obrigatórias para username', () => {
      const usernameControl = component.registerForm.get('username');
      expect(usernameControl?.hasError('required')).toBeTrue();
    });

    it('deve ter validação de comprimento mínimo para username', () => {
      const usernameControl = component.registerForm.get('username');
      usernameControl?.setValue('ab');
      expect(usernameControl?.hasError('minlength')).toBeTrue();
    });

    it('deve ter validação de comprimento máximo para username', () => {
      const usernameControl = component.registerForm.get('username');
      const longUsername = 'a'.repeat(ValidationRules.USERNAME_MAX_LENGTH + 1);
      usernameControl?.setValue(longUsername);
      expect(usernameControl?.hasError('maxlength')).toBeTrue();
    });

    it('deve ter validação de email', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('invalid-email');
      expect(emailControl?.hasError('email')).toBeTrue();
    });

    it('deve aceitar email válido', () => {
      const emailControl = component.registerForm.get('email');
      emailControl?.setValue('test@example.com');
      expect(emailControl?.valid).toBeTrue();
    });

    it('deve ter validação de password mismatch', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password456'
      });

      const confirmPasswordControl = component.registerForm.get('confirmPassword');
      expect(confirmPasswordControl?.hasError('passwordMismatch')).toBeTrue();
    });

    it('deve aceitar passwords que coincidem', () => {
      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      expect(component.registerForm.valid).toBeTrue();
    });
  });

  describe('passwordMatchValidator', () => {
    it('deve retornar erro quando passwords não coincidem', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password456'
      });

      const result = component.passwordMatchValidator(component.registerForm);
      expect(result).toEqual({ passwordMismatch: true });
    });

    it('deve retornar null quando passwords coincidem', () => {
      component.registerForm.patchValue({
        password: 'password123',
        confirmPassword: 'password123'
      });

      const result = component.passwordMatchValidator(component.registerForm);
      expect(result).toBeNull();
    });
  });

  describe('onSubmit', () => {
    it('não deve fazer nada se o formulário for inválido', () => {
      component.registerForm.patchValue({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });

      component.onSubmit();

      expect(authService.register).not.toHaveBeenCalled();
    });

    it('deve chamar authService.register quando o formulário for válido', () => {
      authService.register.and.returnValue(of({}));
      authService.login.and.returnValue(of(mockLoginResponse));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(authService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('não deve incluir confirmPassword nos dados enviados', () => {
      authService.register.and.returnValue(of({}));
      authService.login.and.returnValue(of(mockLoginResponse));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      const callArgs = authService.register.calls.mostRecent().args[0] as any;
      expect(callArgs.confirmPassword).toBeUndefined();
      expect(callArgs.username).toBe('testuser');
      expect(callArgs.email).toBe('test@example.com');
      expect(callArgs.password).toBe('password123');
    });

    it('deve fazer login automático após registo bem-sucedido', () => {
      authService.register.and.returnValue(of({}));
      authService.login.and.returnValue(of(mockLoginResponse));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(authService.login).toHaveBeenCalledWith({
        username: 'testuser',
        password: 'password123'
      });
    });

    it('deve chamar setAuthData e navegar para /tasks após login bem-sucedido', () => {
      authService.register.and.returnValue(of({}));
      authService.login.and.returnValue(of(mockLoginResponse));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(authService.setAuthData).toHaveBeenCalledWith(mockLoginResponse);
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('deve definir errorMessage em caso de erro no registo', () => {
      const errorMessage = 'Erro ao criar conta';
      authService.register.and.returnValue(throwError(() => new Error(errorMessage)));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });

    it('deve definir errorMessage em caso de erro no login após registo', () => {
      const errorMessage = 'Erro ao iniciar sessão';
      authService.register.and.returnValue(of({}));
      authService.login.and.returnValue(throwError(() => new Error(errorMessage)));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });

    it('deve definir isLoading como true durante o processo', () => {
      authService.register.and.returnValue(of({}));
      authService.login.and.returnValue(of(mockLoginResponse));

      component.registerForm.patchValue({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });

      component.onSubmit();

      expect(component.isLoading).toBeTrue();
    });
  });

  describe('messages', () => {
    it('deve retornar messagesService', () => {
      expect(component.messages).toBe(messagesService);
    });
  });
});

