import { Component } from '@angular/core';
import { AuthService } from './jwt/auth.service';
import { UserService } from './jwt/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  constructor() {}
}
