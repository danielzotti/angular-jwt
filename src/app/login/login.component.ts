import { Component } from '@angular/core';
import { AuthService } from '../jwt/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  template: `
    <input name="email" #username placeholder="email" />
    <input name="password" type="password" #password placeholder="password" />
    <button (click)="login(username, password)">Login</button>
  `
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {}

  login(email, password) {
    this.authService.login({ email, password }).subscribe(res => {
      console.log(res);
      this.router.navigateByUrl('/users');
    });
  }
}
