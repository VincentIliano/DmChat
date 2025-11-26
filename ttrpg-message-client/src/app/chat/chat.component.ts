import { Component, OnInit } from '@angular/core';
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

  constructor(private signalrService: SignalrService) { }

  ngOnInit(): void {
    this.signalrService.startConnection();
    this.signalrService.addMessageListener();
    this.signalrService.messageReceived.subscribe((data: any) => {
      this.messages.push(data);
    });
  }

  sendMessage() {
    this.signalrService.sendMessage(this.user, this.newMessage);
    this.newMessage = '';
  }
}
