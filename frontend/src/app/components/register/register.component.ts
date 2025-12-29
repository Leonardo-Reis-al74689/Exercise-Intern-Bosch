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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messagesService: MessagesService
  ) {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(ValidationRules.USERNAME_MIN_LENGTH), Validators.maxLength(ValidationRules.USERNAME_MAX_LENGTH)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(ValidationRules.PASSWORD_MIN_LENGTH)]],
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
      
      const { confirmPassword, ...userData } = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: () => {
          // Após registo bem-sucedido, fazer login automático
          this.authService.login({
            username: userData.username,
            password: userData.password
          }).subscribe({
            next: (response) => {
              this.authService.setAuthData(response);
              this.router.navigate(['/tasks']);
            },
            error: (error) => {
              this.errorMessage = error.message || this.messages.AUTH.LOGIN_ERROR;
              this.isLoading = false;
            }
          });
        },
        error: (error) => {
          this.errorMessage = error.message || this.messages.AUTH.REGISTER_ERROR;
          this.isLoading = false;
        }
      });
    }
  }

  get messages() {
    return this.messagesService;
  }
}

