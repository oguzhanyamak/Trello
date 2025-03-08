import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CurrentUserInterface } from '../types/currentUser.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { RegisterRequestInterface } from '../types/registerRequest.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser$ = new BehaviorSubject<CurrentUserInterface |null | undefined>(undefined)

  constructor(private http:HttpClient) { }


  getCurrentUser():Observable<CurrentUserInterface>{
    return this.http.get<CurrentUserInterface>(environment.apiUrl+'/user');
  }
  setCurrentUser(currentUser:CurrentUserInterface | null):void {
    this.currentUser$.next(currentUser);
  }
  register(registerRequest:RegisterRequestInterface):Observable<CurrentUserInterface>{
    return this.http.post<CurrentUserInterface>(environment.apiUrl+'/users',registerRequest);
  }

  setToken(currentUser:CurrentUserInterface):void{
    localStorage.setItem('token',currentUser.token);
  }
}
