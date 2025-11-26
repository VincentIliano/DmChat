import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class AuthComponent {
  isLogin = true;
  username = '';
  password = '';

  constructor(private authService: AuthService, private router: Router) { }

  toggleForm(event: Event) {
    event.preventDefault();
    this.isLogin = !this.isLogin;
  }

  onSubmit() {
    if (this.isLogin) {
      this.authService.login({ username: this.username, password: this.password })
        .subscribe((response: any) => {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dm-dashboard']);
        });
    } else {
      this.authService.register({ username: this.username, password: this.password })
        .subscribe((response: any) => {
          this.isLogin = true;
        });
    }
  }
}
