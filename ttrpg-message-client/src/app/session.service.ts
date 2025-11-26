import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = 'https://localhost:7038/api/session';

  constructor(private http: HttpClient) { }

  joinSession(sessionId: string, characterName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/join`, { sessionId, characterName });
  }
}
