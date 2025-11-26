import { Component, OnInit } from '@angular/core';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dm-dashboard',
  templateUrl: './dm-dashboard.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DmDashboardComponent implements OnInit {
  sessionName = '';
  sessions: any[] = [];

  constructor(private sessionService: SessionService) { }

  ngOnInit() {
    this.loadSessions();
  }

  loadSessions() {
    this.sessionService.getSessions()
      .subscribe((response: any) => {
        this.sessions = response;
      });
  }

  onSubmit() {
    this.sessionService.createSession(this.sessionName)
      .subscribe(() => {
        this.loadSessions();
        this.sessionName = '';
      });
  }
}
