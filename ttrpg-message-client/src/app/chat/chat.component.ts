import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SignalrService } from '../signalr.service';
import { ThemeService } from '../theme.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class ChatComponent implements OnInit {
  messages: { user: string, message: string }[] = [];
  newMessage = '';
  user = 'Player';
  sessionId: string = '';
  playerId: number = 0;

  constructor(
    private signalrService: SignalrService, 
    private route: ActivatedRoute, 
    private router: Router,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    
    // Load theme for this session
    const sessionIdNum = parseInt(this.sessionId, 10);
    if (!isNaN(sessionIdNum)) {
      const sessionTheme = this.themeService.getSessionTheme(sessionIdNum);
      this.themeService.setTheme(sessionTheme, true);
    }
    
    this.route.queryParams.subscribe(params => {
        let playerIdParam = params['playerId'];
        let characterNameParam = params['characterName'];

        if (playerIdParam) {
           this.playerId = +playerIdParam;
           if (characterNameParam) {
             this.user = characterNameParam;
           }

           // Update localStorage with fresh data from URL if available
           localStorage.setItem('ttrpg_session', JSON.stringify({
             sessionId: this.sessionId,
             playerId: this.playerId,
             characterName: this.user
           }));
        } else {
           // Try to load from localStorage
           const stored = localStorage.getItem('ttrpg_session');
           if (stored) {
             const sessionData = JSON.parse(stored);
             // Ensure the stored session matches the current URL session
             if (sessionData.sessionId == this.sessionId) {
               this.playerId = sessionData.playerId;
               this.user = sessionData.characterName;
             }
           }
        }

        if (this.playerId) {
            this.signalrService.startConnection(this.sessionId, this.playerId);
            this.signalrService.addMessageListener();
            this.signalrService.messageReceived.subscribe((data: any) => {
              // Create new array reference for change detection
              // The backend now sends { user, message, playerId, isFromDm }
              // The Chat component expects { user, message } which is compatible.
              this.messages = [...this.messages, data];
              this.cdr.detectChanges();
              // Auto-scroll to bottom after message is added
              setTimeout(() => this.scrollToBottom(), 100);
            });
        } else {
            // No player ID found in URL or Storage - redirect to join
            this.router.navigate(['/join']);
        }
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
        // Updated signature: user and isDm are ignored by service/backend
        this.signalrService.sendMessage(this.sessionId, this.user, this.newMessage, this.playerId, false);
        this.newMessage = '';
        this.cdr.detectChanges();
    }
  }

  private scrollToBottom() {
    const messageContainer = document.querySelector('.message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }
}
