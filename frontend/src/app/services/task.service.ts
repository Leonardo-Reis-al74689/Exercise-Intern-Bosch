import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Task, TaskCreate, TaskUpdate, TaskResponse } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private apiService: ApiService) {}

  getTasks(): Observable<TaskResponse> {
    return this.apiService.get<TaskResponse>('/tasks');
  }

  getTask(id: number): Observable<TaskResponse> {
    return this.apiService.get<TaskResponse>(`/tasks/${id}`);
  }

  createTask(taskData: TaskCreate): Observable<TaskResponse> {
    return this.apiService.post<TaskResponse>('/tasks', taskData);
  }

  updateTask(id: number, taskData: TaskUpdate): Observable<TaskResponse> {
    return this.apiService.put<TaskResponse>(`/tasks/${id}`, taskData);
  }

  deleteTask(id: number): Observable<TaskResponse> {
    return this.apiService.delete<TaskResponse>(`/tasks/${id}`);
  }
}

