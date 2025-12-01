import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TaskService } from '../../app/services/task.service';
import { ApiService } from '../../app/services/api.service';
import { Task, TaskCreate, TaskUpdate } from '../../app/models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let apiService: jasmine.SpyObj<ApiService>;

  const mockTask: Task = {
    id: 1,
    title: 'Tarefa de teste',
    description: 'Descrição da tarefa',
    completed: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    user_id: 1
  };

  const mockTaskResponse = {
    message: 'Sucesso',
    task: mockTask
  };

  beforeEach(() => {
    const apiServiceSpy = jasmine.createSpyObj('ApiService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TaskService,
        { provide: ApiService, useValue: apiServiceSpy }
      ]
    });

    service = TestBed.inject(TaskService);
    apiService = TestBed.inject(ApiService) as jasmine.SpyObj<ApiService>;
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  describe('getTasks', () => {
    it('deve chamar apiService.get com o endpoint correto', () => {
      apiService.get.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.getTasks();

      expect(apiService.get).toHaveBeenCalledWith('/tasks');
    });
  });

  describe('getTask', () => {
    it('deve chamar apiService.get com o ID correto', () => {
      const taskId = 1;
      apiService.get.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.getTask(taskId);

      expect(apiService.get).toHaveBeenCalledWith(`/tasks/${taskId}`);
    });
  });

  describe('createTask', () => {
    it('deve chamar apiService.post com os dados corretos', () => {
      const taskData: TaskCreate = {
        title: 'Nova tarefa',
        description: 'Descrição',
        completed: false
      };
      apiService.post.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.createTask(taskData);

      expect(apiService.post).toHaveBeenCalledWith('/tasks', taskData);
    });
  });

  describe('updateTask', () => {
    it('deve chamar apiService.put com o ID e dados corretos', () => {
      const taskId = 1;
      const taskData: TaskUpdate = {
        title: 'Tarefa atualizada',
        completed: true
      };
      apiService.put.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.updateTask(taskId, taskData);

      expect(apiService.put).toHaveBeenCalledWith(`/tasks/${taskId}`, taskData);
    });
  });

  describe('deleteTask', () => {
    it('deve chamar apiService.delete com o ID correto', () => {
      const taskId = 1;
      apiService.delete.and.returnValue(jasmine.createSpyObj('Observable', ['subscribe']));

      service.deleteTask(taskId);

      expect(apiService.delete).toHaveBeenCalledWith(`/tasks/${taskId}`);
    });
  });
});

