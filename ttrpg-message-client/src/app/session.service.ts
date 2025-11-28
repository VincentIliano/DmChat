import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private baseUrl = `${environment.apiUrl}/session`;

  constructor(private http: HttpClient) { }

  joinSession(sessionId: string, characterName: string, password?: string): Observable<any> {
    // Convert sessionId to number as backend expects int
    const sessionIdNum = parseInt(sessionId, 10);
    if (isNaN(sessionIdNum)) {
      throw new Error('Session ID must be a valid number');
    }
    return this.http.post(`${this.baseUrl}/join`, { 
      sessionId: sessionIdNum, 
      characterName, 
      password: password || '' 
    });
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
