import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { MessagesService } from '../../core/services/messages.service';

@Component({
  selector: 'app-task-delete',
  templateUrl: './task-delete.component.html',
  styleUrls: ['./task-delete.component.css']
})
export class TaskDeleteComponent {
  @Input() taskId!: number;
  @Output() taskDeleted = new EventEmitter<void>();
  
  isDeleting: boolean = false;
  showConfirm: boolean = false;

  constructor(
    private taskService: TaskService,
    private messagesService: MessagesService
  ) {}

  onDelete(): void {
    this.showConfirm = true;
  }

  confirmDelete(): void {
    this.isDeleting = true;
    
    this.taskService.deleteTask(this.taskId).subscribe({
      next: () => {
        this.taskDeleted.emit();
        this.showConfirm = false;
        this.isDeleting = false;
      },
      error: (error) => {
        alert(error.message || this.messages.TASKS.DELETE_ERROR);
        this.isDeleting = false;
        this.showConfirm = false;
      }
    });
  }

  cancelDelete(): void {
    this.showConfirm = false;
  }

  get messages() {
    return this.messagesService;
  }
}

