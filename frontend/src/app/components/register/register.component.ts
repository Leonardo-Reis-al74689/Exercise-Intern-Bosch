import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessagesService } from '../../core/services/messages.service';
import { ValidationRules } from '../../core/enums/validation-rules.enum';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: false
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  isLoading: boolean = false;
  showColdStartMessage: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messagesService: MessagesService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(ValidationRules.USERNAME_MIN_LENGTH), Validators.maxLength(ValidationRules.USERNAME_MAX_LENGTH)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(ValidationRules.PASSWORD_MIN_LENGTH),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/)
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.showColdStartMessage = false;
      
      const coldStartTimer = setTimeout(() => {
        if (this.isLoading) {
          this.showColdStartMessage = true;
        }
      }, 3000);
      
      const { confirmPassword, ...userData } = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: () => {
          this.authService.login({
            username: userData.username,
            password: userData.password
          }).subscribe({
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
        },
        error: (error) => {
          clearTimeout(coldStartTimer);
          this.errorMessage = error.message || this.messages.AUTH.REGISTER_ERROR;
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

