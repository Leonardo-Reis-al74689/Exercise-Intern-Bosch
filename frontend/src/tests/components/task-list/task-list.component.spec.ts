import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TaskListComponent } from '../../../app/components/task-list/task-list.component';
import { TaskService } from '../../../app/services/task.service';
import { AuthService } from '../../../app/services/auth.service';
import { ThemeService } from '../../../app/core/services/theme.service';
import { MessagesService } from '../../../app/core/services/messages.service';
import { Task, TaskResponse } from '../../../app/models/task.model';
import { ThemeMode } from '../../../app/core/enums/theme-mode.enum';
import { ValidationRules } from '../../../app/core/enums/validation-rules.enum';
import { User } from '../../../app/models/user.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let authService: jasmine.SpyObj<AuthService>;
  let themeService: jasmine.SpyObj<ThemeService>;
  let messagesService: jasmine.SpyObj<MessagesService>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00Z'
  };

  const mockTasks: Task[] = [
    {
      id: 1,
      title: 'Tarefa 1',
      description: 'Descrição da tarefa 1',
      completed: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      user_id: 1
    },
    {
      id: 2,
      title: 'Tarefa 2',
      description: 'Descrição da tarefa 2',
      completed: true,
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
      user_id: 1
    }
  ];

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'updateTask']);
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'logout']);
    const themeServiceSpy = jasmine.createSpyObj('ThemeService', ['toggleTheme'], {
      currentTheme$: of(ThemeMode.LIGHT)
    });
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', [], {
      TASKS: {
        LOAD_ERROR: 'Erro ao carregar tarefas',
        UPDATE_ERROR: 'Erro ao atualizar tarefa'
      }
    });

    await TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ThemeService, useValue: themeServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    themeService = TestBed.inject(ThemeService) as jasmine.SpyObj<ThemeService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;

    authService.getCurrentUser.and.returnValue(mockUser);
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('deve carregar o utilizador atual e as tarefas', () => {
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));

      component.ngOnInit();

      expect(authService.getCurrentUser).toHaveBeenCalled();
      expect(component.currentUser).toEqual(mockUser);
      expect(taskService.getTasks).toHaveBeenCalled();
    });

    it('deve subscrever ao tema atual', () => {
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: [], message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));
      const themeSubject = of(ThemeMode.DARK);
      Object.defineProperty(themeService, 'currentTheme$', { value: themeSubject });

      component.ngOnInit();

      expect(component.currentTheme).toBe(ThemeMode.DARK);
    });
  });

  describe('loadTasks', () => {
    it('deve carregar tarefas com sucesso', () => {
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));

      component.loadTasks();

      expect(component.tasks).toEqual(mockTasks);
      expect(component.isLoading).toBeFalse();
      expect(component.errorMessage).toBe('');
    });

    it('deve definir isLoading como true durante o carregamento', () => {
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));

      component.loadTasks();

      expect(component.isLoading).toBeFalse(); // Deve ser false após sucesso
    });

    it('deve tratar erro ao carregar tarefas', () => {
      const errorMessage = 'Erro ao carregar';
      taskService.getTasks.and.returnValue(throwError(() => new Error(errorMessage)));

      component.loadTasks();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
      expect(component.tasks).toEqual([]);
    });

    it('deve usar mensagem padrão quando erro não tem mensagem', () => {
      taskService.getTasks.and.returnValue(throwError(() => new Error('')));

      component.loadTasks();

      expect(component.errorMessage).toBe(messagesService.TASKS.LOAD_ERROR);
    });

    it('deve limpar errorMessage antes de carregar', () => {
      component.errorMessage = 'Erro anterior';
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));

      component.loadTasks();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('onTaskDeleted', () => {
    it('deve recarregar as tarefas', () => {
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));
      spyOn(component, 'loadTasks');

      component.onTaskDeleted();

      expect(component.loadTasks).toHaveBeenCalled();
    });
  });

  describe('onTaskUpdated', () => {
    it('deve recarregar as tarefas', () => {
      const mockResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.getTasks.and.returnValue(of(mockResponse));
      spyOn(component, 'loadTasks');

      component.onTaskUpdated();

      expect(component.loadTasks).toHaveBeenCalled();
    });
  });

  describe('toggleTaskComplete', () => {
    it('deve atualizar o estado de conclusão da tarefa', () => {
      const task = mockTasks[0];
      const updateResponse: TaskResponse = { task, message: 'Sucesso' };
      const loadResponse: TaskResponse = { task: mockTasks[0], tasks: mockTasks, message: 'Sucesso' };
      taskService.updateTask.and.returnValue(of(updateResponse));
      taskService.getTasks.and.returnValue(of(loadResponse));
      spyOn(component, 'loadTasks');

      component.toggleTaskComplete(task);

      expect(taskService.updateTask).toHaveBeenCalledWith(task.id, { completed: true });
      expect(component.loadTasks).toHaveBeenCalled();
    });

    it('deve tratar erro ao atualizar tarefa', () => {
      const task = mockTasks[0];
      const errorMessage = 'Erro ao atualizar';
      taskService.updateTask.and.returnValue(throwError(() => new Error(errorMessage)));

      component.toggleTaskComplete(task);

      expect(component.errorMessage).toBe(errorMessage);
    });

    it('deve usar mensagem padrão quando erro não tem mensagem', () => {
      const task = mockTasks[0];
      taskService.updateTask.and.returnValue(throwError(() => new Error('')));

      component.toggleTaskComplete(task);

      expect(component.errorMessage).toBe(messagesService.TASKS.UPDATE_ERROR);
    });
  });

  describe('logout', () => {
    it('deve chamar authService.logout', () => {
      component.logout();
      expect(authService.logout).toHaveBeenCalled();
    });
  });

  describe('toggleTheme', () => {
    it('deve chamar themeService.toggleTheme', () => {
      component.toggleTheme();
      expect(themeService.toggleTheme).toHaveBeenCalled();
    });
  });

  describe('shouldShowMoreButton', () => {
    it('deve retornar true quando descrição é maior que o limite', () => {
      const longDescription = 'a'.repeat(ValidationRules.DESCRIPTION_TRUNCATE_LENGTH + 1);
      expect(component.shouldShowMoreButton(longDescription)).toBeTrue();
    });

    it('deve retornar false quando descrição é menor ou igual ao limite', () => {
      const shortDescription = 'a'.repeat(ValidationRules.DESCRIPTION_TRUNCATE_LENGTH);
      expect(component.shouldShowMoreButton(shortDescription)).toBeFalse();
    });

    it('deve retornar false quando descrição é null', () => {
      expect(component.shouldShowMoreButton(null as any)).toBeFalse();
    });

    it('deve retornar false quando descrição é vazia', () => {
      expect(component.shouldShowMoreButton('')).toBeFalse();
    });
  });

  describe('messages', () => {
    it('deve retornar messagesService', () => {
      expect(component.messages).toBe(messagesService);
    });
  });
});

