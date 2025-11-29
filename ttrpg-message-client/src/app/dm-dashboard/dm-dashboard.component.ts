import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
  isLoading = false;

  constructor(
    private sessionService: SessionService, 
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    console.log('Loading sessions...');
    this.isLoading = true;
    this.sessionService.getSessions()
      .subscribe({
        next: (response: any) => {
          console.log('Sessions loaded:', response);
          this.sessions = Array.isArray(response) ? response : [];
          this.errorMessage = '';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load sessions', err);
          this.errorMessage = 'Failed to load sessions. Please try logging in again.';
          this.sessions = [];
          this.isLoading = false;
          this.cdr.detectChanges();
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
    // Reload sessions when modal closes in case a new one was created elsewhere
    this.loadSessions();
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
