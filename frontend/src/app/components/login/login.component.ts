import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../core/services/messages.service';
import { ValidationRules } from '../../core/enums/validation-rules.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showColdStartMessage: boolean = false;
  private loadingStartTime: number = 0;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messagesService: MessagesService
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(ValidationRules.USERNAME_MIN_LENGTH)]],
      password: ['', [Validators.required, Validators.minLength(ValidationRules.PASSWORD_MIN_LENGTH)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showColdStartMessage = false;
      this.loadingStartTime = Date.now();
      
      const coldStartTimer = setTimeout(() => {
        if (this.isLoading) {
          this.showColdStartMessage = true;
        }
      }, 3000);
      
      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          clearTimeout(coldStartTimer);
          this.authService.setAuthData(response);
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          clearTimeout(coldStartTimer);
          this.errorMessage = error.message || this.messages.AUTH.LOGIN_ERROR;
          this.isLoading = false;
          this.showColdStartMessage = false;
        }
      });
    }
  }

  get messages() {
    return this.messagesService;
  }
}

