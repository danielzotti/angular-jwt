import { Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable, Subject, empty } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthService {
  public static apiBaseUrl = '/auth';
  public static apiUrl = `/api${AuthService.apiBaseUrl}`;

  public static ACCESS_TOKEN = 'dz_access_token';
  public static REFRESH_TOKEN = 'dz_refresh_token';

  constructor(private http: HttpClient, private router: Router) {}

  public decodeToken = token => {
    if (!token) {
      return null;
    }
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  public isTokenExpired = (decodedToken: IAccessToken) => {
    if (decodedToken.exp < (new Date().getTime() + 1) / 1000) {
      return false;
    }
    return true;
  }

  public hasTokens = (): boolean => {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();
    return accessToken !== undefined && accessToken !== null && refreshToken !== undefined && refreshToken !== null;
  }

  public getAccessToken = (): string => {
    return localStorage.getItem(AuthService.ACCESS_TOKEN);
  }

  public setAccessToken = accessToken => {
    localStorage.setItem(AuthService.ACCESS_TOKEN, accessToken);
  }

  public getRefreshToken = (): string => {
    return localStorage.getItem(AuthService.REFRESH_TOKEN);
  }

  public setRefreshToken = refreshToken => {
    localStorage.setItem(AuthService.REFRESH_TOKEN, refreshToken);
  }

  public getAuthorizationHeader = (): string => {
    return typeof this.getAccessToken() !== undefined && this.getAccessToken() !== null ? 'Bearer ' + this.getAccessToken() : null;
  }

  public getDecodedToken = (): IAccessToken => {
    const token: string = this.getAccessToken();
    if (token === null || token === undefined) {
      return null;
    }

    const decodedToken: IAccessToken = this.decodeToken(token);

    return decodedToken;
  }

  public isAuthenticated = (): boolean => {
    const token = this.getAccessToken();

    if (token == null) {
      return false;
    }

    return !this.isTokenExpired(this.decodeToken(token));
  }

  // AUTH API

  public login = (value: { email: string; password: string }) => {
    const body = 'grant_type=password' + '&username=' + encodeURIComponent(value.email) + '&password=' + encodeURIComponent(value.password);

    return this.http
      .post<ILoginResponse>(AuthService.apiUrl + '/login', body, {
        headers: new HttpHeaders().set('Content-type', 'x-www-form-url-encoded')
      })
      .pipe(map(this.updateLocalStorage));
  }

  public refreshToken = () => {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return empty();
    }
    const body = 'grant_type=refresh_token' + '&refresh_token=' + encodeURIComponent(refreshToken);
    return this.http
      .post<ILoginResponse>(AuthService.apiUrl + '/login', body, {
        headers: new HttpHeaders().set('Content-type', 'x-www-form-url-encoded')
      })
      .pipe(map(this.updateLocalStorage));
  }

  public updateLocalStorage = (resp: ILoginResponse) => {
    this.setAccessToken(resp.access_token);
    this.setRefreshToken(resp.refresh_token);
    return resp;
  }
}

export interface IAccessToken {
  name: string;
  email: string;
  exp: number;
}

export interface ILoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}
