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
  user = 'Player'; // Placeholder for the current user
  sessionId: string = '';

  constructor(private signalrService: SignalrService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    this.signalrService.startConnection(this.sessionId);
    this.signalrService.addMessageListener();
    this.signalrService.messageReceived.subscribe((data: any) => {
      this.messages.push(data);
    });
  }

  sendMessage() {
    this.signalrService.sendMessage(this.sessionId, this.user, this.newMessage);
    this.newMessage = '';
  }
}
