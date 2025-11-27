import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../signalr.service';
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

  constructor(private signalrService: SignalrService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    this.route.queryParams.subscribe(params => {
        this.playerId = +params['playerId'];
        if (params['characterName']) {
          this.user = params['characterName'];
        }

        if (this.playerId) {
            this.signalrService.startConnection(this.sessionId, this.playerId);
            this.signalrService.addMessageListener();
            this.signalrService.messageReceived.subscribe((data: any) => {
              // Push the message object directly.
              // The backend now sends { user, message, playerId, isFromDm }
              // The Chat component expects { user, message } which is compatible.
              this.messages.push(data);
            });
        }
    });
  }

  sendMessage() {
    if (this.newMessage.trim()) {
        this.signalrService.sendMessage(this.sessionId, this.user, this.newMessage, this.playerId, false);
        this.newMessage = '';
    }
  }
}
