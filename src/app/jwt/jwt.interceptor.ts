import { Injectable, Injector, Inject, forwardRef } from '@angular/core';
import { Router, RouterState, ActivatedRoute } from '@angular/router';
import { Subject, Observable, throwError, empty } from 'rxjs';
import { tap, map, catchError, finalize, switchMap } from 'rxjs/operators';
import { HttpRequest, HttpHandler, HttpEventType, HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  static authFailedRedirectUrl = '/login';
  static loginUrl = '/login';

  isRefreshingToken = false;

  tokenRefreshedSource = new Subject();
  tokenRefreshed$ = this.tokenRefreshedSource.asObservable();

  authService: AuthService;
  router: Router;

  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    this.authService = this.injector.get(AuthService);
    this.router = this.injector.get(Router);
    // this.http = this.injector.get(HttpClient);

    // Handle request
    request = this.addAuthHeader(request);

    // Handle response
    return next.handle(request).pipe(
      map(event => {
        // if (event.type === HttpEventType.Response) {
        //  console.log(event);
        // }
        if (event.type === HttpEventType.ResponseHeader) {
          //   console.log(event);
        } else if (event.type === HttpEventType.Response) {
          //   console.log(event);
          return event;
        }
      }),
      catchError(error => {
        // CONNECTIONS REFUSED
        if (this.isConnectionRefused(error)) {
          console.log('[jwt.interceptor] Server is down.');
          return throwError(error);
        }

        // INVALID GRANT
        if (this.isInvalidGrant(error)) {
          if (
            // !this.authService.isAuthenticated() &&
            this.router.url !== JwtInterceptor.loginUrl &&
            this.router.url !== JwtInterceptor.authFailedRedirectUrl
          ) {
            this.router.navigateByUrl(JwtInterceptor.authFailedRedirectUrl);
          }

          return throwError(error);
        }

        // INVALID UNAUTHORIZED
        if (this.isInvalidToken(error)) {
          console.log('[jwt.interceptor] Is Unauthorized');
          if (this.authService.hasTokens()) {
            return this.refreshToken().pipe(
              switchMap(() => {
                console.log('[jwt.interceptor] Is Unauthorized -> Token refreshed');
                request = this.addAuthHeader(request);
                return next.handle(request);
              }),
              catchError(err => {
                console.log('[jwt.interceptor] Is Unauthorized -> Error refreshing token');
                if (this.isInvalidToken(err)) {
                  this.goToLogin();
                }
                return throwError(err);
              })
            );
          } else {
            console.log('[jwt.interceptor] Is Unauthorized. Reindirizzo a login...');
            this.goToLogin();
            return empty();
          }
        }

        return throwError(error);
      })
    );
  }

  private addAuthHeader(request: HttpRequest<any>) {
    const authHeader = this.authService.getAuthorizationHeader();
    if (authHeader != null) {
      return request.clone({
        reportProgress: true,
        setHeaders: {
          Accept: 'application/json',
          Authorization: authHeader
        }
      });
    }

    return request;
  }

  private refreshToken() {
    if (this.isRefreshingToken) {
      // console.log("[jwt.interceptor:refreshToken] refresh token already in progress. Adding request to pipe...");
      return new Observable(observer => {
        this.tokenRefreshed$.subscribe(() => {
          observer.next();
          observer.complete();
        });
      });
    } else {
      console.log('[jwt.interceptor:refreshToken] begin refreshing token');
      this.isRefreshingToken = true;

      return this.authService.refreshToken().pipe(
        map(res => {
          console.log('[jwt.interceptor:refreshToken] refresh token done');
          this.isRefreshingToken = false;
          this.tokenRefreshedSource.next();
          return res;
        }),
        finalize(() => {
          this.isRefreshingToken = false;
          console.log('[jwt.interceptor:refreshToken] finalize');
          // return this.http.request(request);
          // this.tokenRefreshedSource.next();
          //   return empty();
        }),
        catchError(err => {
          console.log('[jwt.interceptor:refreshToken] error in refreshing token');
          console.log(err);
          this.isRefreshingToken = false;
          // this.tokenRefreshedSource.next();
          // this.goToLogin();
          // return empty();
          return throwError(err);
        })
      );
    }
  }

  private goToLogin() {
    this.router.navigateByUrl(JwtInterceptor.authFailedRedirectUrl);
  }

  private isUnauthorized = res => {
    return res.status === 401 || res.status === 403;
  }

  private isInvalidToken = res => {
    if (!this.isUnauthorized(res)) {
      return false;
    }

    if (typeof res.statusText === 'undefined' || res.statusText == null) {
      return false;
    }

    return res.statusText === 'invalid_token';
  }

  private isInvalidGrant = res => {
    if (res.status !== 400) {
      return false;
    }

    if (typeof res.error === 'undefined' && res.error == null) {
      return false;
    }

    let e: { error: string; error_description: string } = null;

    try {
      e = JSON.parse(res.error);
    } catch (ex) {
      console.log('[jwt.interceptor]', res);
      return false;
    }

    return e != null && typeof e.error !== 'undefined' && e.error != null && e.error === 'invalid_grant';
  }

  private isConnectionRefused = res => {
    return res.status === 0;
  }
}
