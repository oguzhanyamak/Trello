import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, map, Observable } from 'rxjs';
import { CurrentUserInterface } from '../types/currentUser.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RegisterRequestInterface } from '../types/registerRequest.interface';
import { LoginRequestInterface } from '../types/loginRequest.interface';

@Injectable({
  providedIn: 'root' // Servisin uygulama genelinde kullanılmasını sağlar
})
export class AuthService {
  // Kullanıcının mevcut durumunu saklayan BehaviorSubject
  // undefined: Bilinmiyor, null: Çıkış yapıldı, CurrentUserInterface: Giriş yapıldı
  currentUser$ = new BehaviorSubject<CurrentUserInterface | null | undefined>(undefined);
  
  // Kullanıcının giriş yapıp yapmadığını takip eden observable
  isLogged$ = this.currentUser$.pipe(
    filter((currentUser) => currentUser !== undefined), // undefined olan değerleri filtrele
    map(Boolean) // currentUser değeri varsa true, yoksa false döndür
  );

  constructor(private http: HttpClient) {}

  // Mevcut kullanıcı bilgilerini API'den getirir
  getCurrentUser(): Observable<CurrentUserInterface> {
    return this.http.get<CurrentUserInterface>(environment.apiUrl + '/user');
  }

  // Kullanıcı bilgisini günceller
  setCurrentUser(currentUser: CurrentUserInterface | null): void {
    this.currentUser$.next(currentUser);
  }

  // Yeni kullanıcı kaydı için API'ye istek gönderir
  register(registerRequest: RegisterRequestInterface): Observable<CurrentUserInterface> {
    return this.http.post<CurrentUserInterface>(environment.apiUrl + '/users', registerRequest);
  }

  // Kullanıcı giriş işlemi için API'ye istek gönderir
  login(loginRequest: LoginRequestInterface): Observable<CurrentUserInterface> {
    return this.http.post<CurrentUserInterface>(environment.apiUrl + '/users/login', loginRequest);
  }

  // Kullanıcı token'ını localStorage'e kaydeder
  setToken(currentUser: CurrentUserInterface): void {
    localStorage.setItem('token', currentUser.token);
  }
}
