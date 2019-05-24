import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, Subject, empty } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class UserService {
  public static apiBaseUrl = '/user';
  public static apiUrl = `/api${UserService.apiBaseUrl}`;

  public static ACCESS_TOKEN = 'dz_access_token';
  public static REFRESH_TOKEN = 'dz_refresh_token';

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<Array<any>>(UserService.apiUrl);
  }
}
