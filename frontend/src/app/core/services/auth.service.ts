import { Injectable, signal, computed } from '@angular/core';

export interface User {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN' | 'SUPPORT';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _currentUser = signal<User | null>(null);
  private _accessToken = signal<string | null>(null);

  currentUser = computed(() => this._currentUser());
  accessToken = computed(() => this._accessToken());
  isAuthenticated = computed(() => !!this._accessToken());

  constructor() {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('current_user');
    if (savedToken && savedUser) {
      this._accessToken.set(savedToken);
      this._currentUser.set(JSON.parse(savedUser));
    }
  }

  login(accessToken: string, user: User) {
    this._accessToken.set(accessToken);
    this._currentUser.set(user);
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  logout() {
    this._accessToken.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  }
}
