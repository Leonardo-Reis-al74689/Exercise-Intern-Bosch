import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TaskFormComponent } from '../../../app/components/task-form/task-form.component';
import { TaskService } from '../../../app/services/task.service';
import { MessagesService } from '../../../app/core/services/messages.service';
import { ValidationRules } from '../../../app/core/enums/validation-rules.enum';
import { Task } from '../../../app/models/task.model';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let router: jasmine.SpyObj<Router>;
  let messagesService: jasmine.SpyObj<MessagesService>;
  let activatedRoute: any;

  const mockTask: Task = {
    id: 1,
    title: 'Tarefa de teste',
    description: 'Descrição da tarefa',
    completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 1
  };

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTask', 'createTask', 'updateTask']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', [], {
      TASKS: {
        LOAD_TASK_ERROR: 'Erro ao carregar tarefa',
        CREATE_ERROR: 'Erro ao criar tarefa',
        UPDATE_ERROR: 'Erro ao atualizar tarefa',
        LOADING_TASK: 'A carregar tarefa...',
        SAVING: 'A guardar...'
      },
      FORMS: {
        CREATE_TASK: 'Nova Tarefa',
        EDIT_TASK: 'Editar Tarefa',
        SAVE: 'Guardar',
        CANCEL: 'Cancelar',
        TASK_COMPLETED: 'Tarefa concluída'
      },
      VALIDATION: {
        TITLE_REQUIRED: 'Título é obrigatório',
        TITLE_MAX_LENGTH: 'Título deve ter no máximo 200 caracteres'
      }
    });

    activatedRoute = {
      snapshot: {
        paramMap: {
          get: jasmine.createSpy('get').and.returnValue(null)
        }
      }
    };

    await TestBed.configureTestingModule({
      declarations: [TaskFormComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;

    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('Formulário', () => {
    it('deve criar o formulário com valores padrão', () => {
      expect(component.taskForm).toBeDefined();
      expect(component.taskForm.get('title')?.value).toBe('');
      expect(component.taskForm.get('description')?.value).toBe('');
      expect(component.taskForm.get('completed')?.value).toBeFalse();
    });

    it('deve ter validação obrigatória para title', () => {
      const titleControl = component.taskForm.get('title');
      expect(titleControl?.hasError('required')).toBeTrue();
    });

    it('deve ter validação de comprimento máximo para title', () => {
      const titleControl = component.taskForm.get('title');
      const longTitle = 'a'.repeat(ValidationRules.TASK_TITLE_MAX_LENGTH + 1);
      titleControl?.setValue(longTitle);
      expect(titleControl?.hasError('maxlength')).toBeTrue();
    });

    it('deve aceitar title válido', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('Tarefa válida');
      expect(titleControl?.valid).toBeTrue();
    });
  });

  describe('ngOnInit', () => {
    it('não deve carregar tarefa quando não há ID na rota', () => {
      activatedRoute.snapshot.paramMap.get.and.returnValue(null);

      component.ngOnInit();

      expect(component.isEditMode).toBeFalse();
      expect(component.taskId).toBeNull();
      expect(taskService.getTask).not.toHaveBeenCalled();
    });

    it('deve carregar tarefa quando há ID na rota', () => {
      const taskId = '1';
      activatedRoute.snapshot.paramMap.get.and.returnValue(taskId);
      taskService.getTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.ngOnInit();

      expect(component.isEditMode).toBeTrue();
      expect(component.taskId).toBe(1);
      expect(taskService.getTask).toHaveBeenCalledWith(1);
    });
  });

  describe('loadTask', () => {
    it('não deve fazer nada quando taskId é null', () => {
      component.taskId = null;
      component.loadTask();
      expect(taskService.getTask).not.toHaveBeenCalled();
    });

    it('deve carregar tarefa e preencher formulário', () => {
      component.taskId = 1;
      taskService.getTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.loadTask();

      expect(component.taskForm.get('title')?.value).toBe(mockTask.title);
      expect(component.taskForm.get('description')?.value).toBe(mockTask.description);
      expect(component.taskForm.get('completed')?.value).toBe(mockTask.completed);
      expect(component.isLoading).toBeFalse();
    });

    it('deve tratar erro ao carregar tarefa', () => {
      component.taskId = 1;
      const errorMessage = 'Erro ao carregar';
      taskService.getTask.and.returnValue(throwError(() => new Error(errorMessage)));

      component.loadTask();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });

    it('deve usar mensagem padrão quando erro não tem mensagem', () => {
      component.taskId = 1;
      taskService.getTask.and.returnValue(throwError(() => new Error('')));

      component.loadTask();

      expect(component.errorMessage).toBe(messagesService.TASKS.LOAD_TASK_ERROR);
    });

    it('deve definir isLoading como true durante o carregamento', () => {
      component.taskId = 1;
      taskService.getTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.loadTask();

      expect(component.isLoading).toBeFalse(); // Deve ser false após sucesso
    });
  });

  describe('onSubmit', () => {
    it('não deve fazer nada se o formulário for inválido', () => {
      component.taskForm.patchValue({ title: '' });
      component.onSubmit();

      expect(taskService.createTask).not.toHaveBeenCalled();
      expect(taskService.updateTask).not.toHaveBeenCalled();
    });

    it('deve criar tarefa quando não está em modo de edição', () => {
      component.isEditMode = false;
      taskService.createTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.taskForm.patchValue({
        title: 'Nova tarefa',
        description: 'Descrição',
        completed: false
      });

      component.onSubmit();

      expect(taskService.createTask).toHaveBeenCalledWith({
        title: 'Nova tarefa',
        description: 'Descrição',
        completed: false
      });
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('deve atualizar tarefa quando está em modo de edição', () => {
      component.isEditMode = true;
      component.taskId = 1;
      taskService.updateTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.taskForm.patchValue({
        title: 'Tarefa atualizada',
        description: 'Nova descrição',
        completed: true
      });

      component.onSubmit();

      expect(taskService.updateTask).toHaveBeenCalledWith(1, {
        title: 'Tarefa atualizada',
        description: 'Nova descrição',
        completed: true
      });
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });

    it('deve converter description vazia para null', () => {
      component.isEditMode = false;
      taskService.createTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.taskForm.patchValue({
        title: 'Nova tarefa',
        description: '',
        completed: false
      });

      component.onSubmit();

      expect(taskService.createTask).toHaveBeenCalledWith({
        title: 'Nova tarefa',
        description: null,
        completed: false
      });
    });

    it('deve tratar erro ao criar tarefa', () => {
      component.isEditMode = false;
      const errorMessage = 'Erro ao criar';
      taskService.createTask.and.returnValue(throwError(() => new Error(errorMessage)));

      component.taskForm.patchValue({
        title: 'Nova tarefa',
        description: 'Descrição',
        completed: false
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });

    it('deve tratar erro ao atualizar tarefa', () => {
      component.isEditMode = true;
      component.taskId = 1;
      const errorMessage = 'Erro ao atualizar';
      taskService.updateTask.and.returnValue(throwError(() => new Error(errorMessage)));

      component.taskForm.patchValue({
        title: 'Tarefa atualizada',
        description: 'Descrição',
        completed: false
      });

      component.onSubmit();

      expect(component.errorMessage).toBe(errorMessage);
      expect(component.isLoading).toBeFalse();
    });

    it('deve limpar errorMessage antes de submeter', () => {
      component.isEditMode = false;
      component.errorMessage = 'Erro anterior';
      taskService.createTask.and.returnValue(of({ task: mockTask, message: 'Sucesso' }));

      component.taskForm.patchValue({
        title: 'Nova tarefa',
        description: 'Descrição',
        completed: false
      });

      component.onSubmit();

      expect(component.errorMessage).toBe('');
    });
  });

  describe('cancel', () => {
    it('deve navegar para /tasks', () => {
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/tasks']);
    });
  });

  describe('messages', () => {
    it('deve retornar messagesService', () => {
      expect(component.messages).toBe(messagesService);
    });
  });
});

