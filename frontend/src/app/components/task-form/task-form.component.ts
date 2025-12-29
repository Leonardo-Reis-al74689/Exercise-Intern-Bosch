import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { MessagesService } from '../../core/services/messages.service';
import { ValidationRules } from '../../core/enums/validation-rules.enum';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css'],
  standalone: false
})
export class TaskFormComponent implements OnInit {
  taskForm: FormGroup;
  taskId: number | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private messagesService: MessagesService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(ValidationRules.TASK_TITLE_MAX_LENGTH)]],
      description: [''],
      completed: [false]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskId = +id;
      this.isEditMode = true;
      this.loadTask();
    }
  }

  loadTask(): void {
    if (!this.taskId) return;

    this.isLoading = true;
    this.taskService.getTask(this.taskId).subscribe({
      next: (response) => {
        const task = response.task;
        this.taskForm.patchValue({
          title: task.title,
          description: task.description || '',
          completed: task.completed
        });
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.messages.TASKS.LOAD_TASK_ERROR;
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const taskData = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description || null,
        completed: this.taskForm.value.completed
      };

      if (this.isEditMode && this.taskId) {
        this.taskService.updateTask(this.taskId, taskData).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            this.errorMessage = error.message || this.messages.TASKS.UPDATE_ERROR;
            this.isLoading = false;
          }
        });
      } else {
        this.taskService.createTask(taskData).subscribe({
          next: () => {
            this.router.navigate(['/tasks']);
          },
          error: (error) => {
            this.errorMessage = error.message || this.messages.TASKS.CREATE_ERROR;
            this.isLoading = false;
          }
        });
      }
    }
  }

  cancel(): void {
    this.router.navigate(['/tasks']);
  }

  get messages() {
    return this.messagesService;
  }
}

