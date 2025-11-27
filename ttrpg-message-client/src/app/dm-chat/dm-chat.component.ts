import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../signalr.service';
import { SessionService } from '../session.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dm-chat',
  templateUrl: './dm-chat.html',
  standalone: true,
  imports: [FormsModule, CommonModule]
})
export class DmChatComponent implements OnInit {
  sessionId: string = '';
  players: any[] = [];
  selectedPlayerId: number | null = null;
  chats: { [playerId: number]: { user: string, message: string, isFromDm: boolean }[] } = {};
  unreadCounts: { [playerId: number]: number } = {};
  newMessage = '';
  dmName = 'DM';

  constructor(
    private route: ActivatedRoute,
    private signalrService: SignalrService,
    private sessionService: SessionService
  ) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    this.loadPlayers();

    this.signalrService.startDmConnection(this.sessionId);
    this.signalrService.addMessageListener();

    this.signalrService.messageReceived.subscribe((data: any) => {
      this.handleIncomingMessage(data);
    });
  }

  loadPlayers() {
    this.sessionService.getPlayers(+this.sessionId).subscribe((data: any) => {
      this.players = data;
      // Initialize chat buffers for all players
      this.players.forEach(p => {
        if (!this.chats[p.id]) {
          this.chats[p.id] = [];
          this.unreadCounts[p.id] = 0;
        }
      });
    });
  }

  handleIncomingMessage(data: { user: string, message: string, playerId: number, isFromDm: boolean }) {
    const pId = data.playerId;
    if (!this.chats[pId]) {
      this.chats[pId] = [];
      this.unreadCounts[pId] = 0;
    }

    this.chats[pId].push(data);

    // If we are not currently viewing this player, increment unread
    // If we are viewing them, we don't need to increment.
    // However, if the message is from the DM (us), we definitely don't increment unread.
    if (!data.isFromDm && this.selectedPlayerId !== pId) {
        this.unreadCounts[pId] = (this.unreadCounts[pId] || 0) + 1;
    }
  }

  selectPlayer(playerId: number) {
    this.selectedPlayerId = playerId;
    this.unreadCounts[playerId] = 0; // Clear unread on selection
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedPlayerId) {
      this.signalrService.sendMessage(
        this.sessionId,
        this.dmName,
        this.newMessage,
        this.selectedPlayerId,
        true // isDm
      );
      this.newMessage = '';
    }
  }

  getMessagesForSelectedPlayer() {
    if (!this.selectedPlayerId) return [];
    return this.chats[this.selectedPlayerId] || [];
  }
}
