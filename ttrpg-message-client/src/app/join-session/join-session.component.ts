import { Component } from '@angular/core';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-join-session',
  templateUrl: './join-session.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class JoinSessionComponent {
  sessionId = '';
  characterName = '';
  password = '';
  errorMessage = '';

  constructor(private sessionService: SessionService, private router: Router) { }

  onSubmit() {
    // Clear previous error
    this.errorMessage = '';
    
    // Validate sessionId is a number
    const sessionIdNum = parseInt(this.sessionId, 10);
    if (isNaN(sessionIdNum) || sessionIdNum <= 0) {
      this.errorMessage = 'Session ID must be a valid positive number.';
      return;
    }
    
    // Validate required fields
    if (!this.characterName || !this.characterName.trim()) {
      this.errorMessage = 'Character name is required.';
      return;
    }
    
    if (!this.password || !this.password.trim()) {
      this.errorMessage = 'Password is required.';
      return;
    }
    
    this.sessionService.joinSession(this.sessionId, this.characterName, this.password)
      .subscribe({
        next: (response: any) => {
          // response contains { playerId, characterId }
          // Store in localStorage for persistence
          localStorage.setItem('ttrpg_session', JSON.stringify({
            sessionId: this.sessionId,
            playerId: response.playerId,
            characterName: this.characterName
          }));

          this.router.navigate(['/chat', this.sessionId], {
              queryParams: {
                  playerId: response.playerId,
                  characterName: this.characterName
              }
          });
        },
        error: (err) => {
          console.error('Join failed', err);
          // Extract error message from API response if available
          if (err.error && typeof err.error === 'string') {
            this.errorMessage = err.error;
          } else if (err.error && err.error.message) {
            this.errorMessage = err.error.message;
          } else if (err.message) {
            this.errorMessage = err.message;
          } else if (err.status === 404) {
            this.errorMessage = 'Session not found. Please check the Session ID.';
          } else if (err.status === 401) {
            this.errorMessage = 'Invalid password for this character.';
          } else if (err.status === 0) {
            this.errorMessage = 'Unable to connect to server. Please check if the API is running.';
          } else {
            this.errorMessage = 'Failed to join session. Please check session ID, character name, and password.';
          }
        }
      });
  }
}
