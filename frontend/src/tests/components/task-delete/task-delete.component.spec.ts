import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { TaskDeleteComponent } from '../../../app/components/task-delete/task-delete.component';
import { TaskService } from '../../../app/services/task.service';
import { MessagesService } from '../../../app/core/services/messages.service';

describe('TaskDeleteComponent', () => {
  let component: TaskDeleteComponent;
  let fixture: ComponentFixture<TaskDeleteComponent>;
  let taskService: jasmine.SpyObj<TaskService>;
  let messagesService: jasmine.SpyObj<MessagesService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['deleteTask']);
    const messagesServiceSpy = jasmine.createSpyObj('MessagesService', [], {
      TASKS: {
        DELETE_ERROR: 'Erro ao eliminar tarefa',
        CONFIRM_DELETE: 'Tem a certeza?',
        DELETING: 'A eliminar...'
      },
      FORMS: {
        DELETE: 'Eliminar',
        YES: 'Sim',
        NO: 'Não'
      }
    });

    await TestBed.configureTestingModule({
      declarations: [TaskDeleteComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MessagesService, useValue: messagesServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDeleteComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    messagesService = TestBed.inject(MessagesService) as jasmine.SpyObj<MessagesService>;

    component.taskId = 1;
    fixture.detectChanges();
  });

  it('deve ser criado', () => {
    expect(component).toBeTruthy();
  });

  describe('onDelete', () => {
    it('deve mostrar confirmação', () => {
      component.onDelete();
      expect(component.showConfirm).toBeTrue();
    });
  });

  describe('confirmDelete', () => {
    it('deve eliminar tarefa e emitir evento taskDeleted', () => {
      taskService.deleteTask.and.returnValue(of({ message: 'Sucesso', task: {} as any }));
      spyOn(component.taskDeleted, 'emit');

      component.confirmDelete();

      expect(taskService.deleteTask).toHaveBeenCalledWith(component.taskId);
      expect(component.taskDeleted.emit).toHaveBeenCalled();
      expect(component.showConfirm).toBeFalse();
      expect(component.isDeleting).toBeFalse();
    });

    it('deve definir isDeleting como true durante a eliminação', () => {
      taskService.deleteTask.and.returnValue(of({ message: 'Sucesso', task: {} as any }));

      component.confirmDelete();

      expect(component.isDeleting).toBeFalse(); // Deve ser false após sucesso
    });

    it('deve tratar erro ao eliminar tarefa', () => {
      const errorMessage = 'Erro ao eliminar';
      taskService.deleteTask.and.returnValue(throwError(() => new Error(errorMessage)));
      spyOn(window, 'alert');

      component.confirmDelete();

      expect(window.alert).toHaveBeenCalledWith(errorMessage);
      expect(component.isDeleting).toBeFalse();
      expect(component.showConfirm).toBeFalse();
    });

    it('deve usar mensagem padrão quando erro não tem mensagem', () => {
      taskService.deleteTask.and.returnValue(throwError(() => new Error('')));
      spyOn(window, 'alert');

      component.confirmDelete();

      expect(window.alert).toHaveBeenCalledWith(messagesService.TASKS.DELETE_ERROR);
    });
  });

  describe('cancelDelete', () => {
    it('deve esconder confirmação', () => {
      component.showConfirm = true;
      component.cancelDelete();
      expect(component.showConfirm).toBeFalse();
    });
  });

  describe('messages', () => {
    it('deve retornar messagesService', () => {
      expect(component.messages).toBe(messagesService);
    });
  });
});

