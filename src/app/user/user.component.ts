import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { UserService } from '../jwt/user.service';

@Component({
  selector: 'app-user',
  template: `
    <button (click)="getUsers()">Refresh users</button>
    <ul>
      <li *ngFor="let user of users$ | async">{{ user.id }}. {{ user.name }} {{ user.surname }}</li>
    </ul>
  `
})
export class UserComponent implements OnInit {
  users$: Observable<Array<any>>;

  constructor(private userService: UserService) {}
  ngOnInit() {
    this.users$ = this.userService.getUsers();
  }

  getUsers() {
    this.users$ = this.userService.getUsers();
  }
}
