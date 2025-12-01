import { Component, OnInit } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { MessagesService } from '../../core/services/messages.service';
import { Task } from '../../models/task.model';
import { ThemeMode } from '../../core/enums/theme-mode.enum';
import { ValidationRules } from '../../core/enums/validation-rules.enum';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.css']
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';
  currentUser: any = null;
  currentTheme: ThemeMode = ThemeMode.LIGHT;

  constructor(
    private taskService: TaskService,
    private authService: AuthService,
    private themeService: ThemeService,
    private messagesService: MessagesService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadTasks();
    
    this.themeService.currentTheme$.subscribe(theme => {
      this.currentTheme = theme;
    });
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.taskService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response.tasks || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || this.messages.TASKS.LOAD_ERROR;
        this.isLoading = false;
      }
    });
  }

  onTaskDeleted(): void {
    this.loadTasks();
  }

  onTaskUpdated(): void {
    this.loadTasks();
  }

  toggleTaskComplete(task: Task): void {
    this.taskService.updateTask(task.id, { completed: !task.completed }).subscribe({
      next: () => {
        this.loadTasks();
      },
      error: (error) => {
        this.errorMessage = error.message || this.messages.TASKS.UPDATE_ERROR;
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  shouldShowMoreButton(description: string): boolean {
    return description ? description.length > ValidationRules.DESCRIPTION_TRUNCATE_LENGTH : false;
  }

  get messages() {
    return this.messagesService;
  }
}

