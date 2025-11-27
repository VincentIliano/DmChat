import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-dm-dashboard',
  templateUrl: './dm-dashboard.html',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class DmDashboardComponent implements OnInit {
  sessionName = '';
  sessions: any[] = [];
  errorMessage: string = '';
  showCreateSessionModal = false;

  constructor(private sessionService: SessionService, private router: Router) { }

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions()
      .subscribe({
        next: (response: any) => {
          this.sessions = response;
          this.errorMessage = '';
        },
        error: (err) => {
          console.error('Failed to load sessions', err);
          this.errorMessage = 'Failed to load sessions. Please try logging in again.';
        }
      });
  }

  openModal() {
    this.showCreateSessionModal = true;
    this.errorMessage = '';
    this.sessionName = '';
  }

  closeModal() {
    this.showCreateSessionModal = false;
    this.errorMessage = '';
    this.sessionName = '';
  }

  onSubmit() {
    this.sessionService.createSession(this.sessionName)
      .subscribe({
        next: (response: any) => {
          this.router.navigate(['/dm-chat', response.sessionId]);
          this.closeModal();
        },
        error: (err) => {
           console.error('Failed to create session', err);
           this.errorMessage = 'Failed to create session.';
        }
      });
  }
}
