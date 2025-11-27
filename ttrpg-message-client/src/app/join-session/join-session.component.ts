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

  constructor(private sessionService: SessionService, private router: Router) { }

  onSubmit() {
    this.sessionService.joinSession(this.sessionId, this.characterName)
      .subscribe((response: any) => {
        // response contains { playerId, characterId }
        this.router.navigate(['/chat', this.sessionId], {
            queryParams: {
                playerId: response.playerId,
                characterName: this.characterName
            }
        });
      });
  }
}
