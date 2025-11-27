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
          this.errorMessage = 'Failed to join session. Please check session ID, character name, and password.';
        }
      });
  }
}
