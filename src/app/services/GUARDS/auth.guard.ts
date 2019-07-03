import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private route: Router) {}

  canActivate(): Promise<boolean> | boolean | Observable<boolean> {
    if (this.auth.isLogged()) {
      return true;
    } else {
      console.log('Not logged');
      this.route.navigate(['/auth/login']);
      return false;
    }
  }
}
