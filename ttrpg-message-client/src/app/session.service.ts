import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = 'https://dmchat-099d.onrender.com/api/session';

  constructor(private http: HttpClient) { }

  joinSession(sessionId: string, characterName: string, password?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/join`, { sessionId, characterName, password });
  }

  createSession(sessionName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, `"${sessionName}"`, { headers: { 'Content-Type': 'application/json' } });
  }

  getSessions(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getPlayers(sessionId: number) {
    return this.http.get(`${this.baseUrl}/${sessionId}/players`);
  }
}
