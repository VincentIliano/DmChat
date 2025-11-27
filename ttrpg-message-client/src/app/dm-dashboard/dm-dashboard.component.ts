import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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

  constructor(private sessionService: SessionService) { }

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

  onSubmit() {
    this.sessionService.createSession(this.sessionName)
      .subscribe({
        next: () => {
          this.loadSessions();
          this.sessionName = '';
          this.errorMessage = '';
        },
        error: (err) => {
           console.error('Failed to create session', err);
           this.errorMessage = 'Failed to create session.';
        }
      });
  }
}
