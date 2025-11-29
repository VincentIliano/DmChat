import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SignalrService } from '../signalr.service';
import { SessionService } from '../session.service';
import { ThemeService, Theme } from '../theme.service';
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
  selectedTheme: Theme = 'neutral';
  themes: { value: Theme; label: string }[] = [
    { value: 'neutral', label: 'Neutral' },
    { value: 'paranoia', label: 'Paranoia XP' },
    { value: 'dnd', label: 'Dungeons & Dragons' }
  ];

  constructor(
    private route: ActivatedRoute,
    private signalrService: SignalrService,
    private sessionService: SessionService,
    private themeService: ThemeService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId')!;
    if (!this.sessionId) {
      console.error('Session ID not found in route parameters');
      return;
    }

    // Load theme for this session
    const sessionIdNum = parseInt(this.sessionId, 10);
    this.selectedTheme = this.themeService.getSessionTheme(sessionIdNum);
    this.themeService.setSessionTheme(sessionIdNum, this.selectedTheme);

    // Set up subscriptions FIRST before starting connection
    this.signalrService.messageReceived.subscribe((data: any) => {
      console.log('DM Chat: Message received subscription triggered', data);
      this.handleIncomingMessage(data);
    });

    this.signalrService.playerJoined.subscribe((player: any) => {
      console.log('DM Chat: Player joined subscription triggered', player);
      this.handlePlayerJoined(player);
    });

    // Load players and start SignalR connection
    this.loadPlayers();
    
    // Start DM connection (listeners are already registered in service constructor)
    this.signalrService.startDmConnection(this.sessionId);
  }

  onThemeChange(): void {
    const sessionIdNum = parseInt(this.sessionId, 10);
    this.themeService.setSessionTheme(sessionIdNum, this.selectedTheme);
  }

  loadPlayers() {
    console.log('Loading players for session:', this.sessionId);
    this.sessionService.getPlayers(+this.sessionId).subscribe({
      next: (data: any) => {
        console.log('Players loaded:', data);
        this.players = data;
        // Initialize chat buffers for all players
        this.players.forEach(p => {
          if (!this.chats[p.id]) {
            this.chats[p.id] = [];
            this.unreadCounts[p.id] = 0;
          }
        });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading players:', err);
      }
    });
  }

  handlePlayerJoined(player: { id: number, characterName: string }) {
    console.log('Player joined:', player);
    // Check if player already exists
    if (!this.players.some(p => p.id === player.id)) {
      this.players = [...this.players, player]; // Create new array reference for change detection
      if (!this.chats[player.id]) {
        this.chats[player.id] = [];
        this.unreadCounts[player.id] = 0;
      }
      console.log('Updated players array:', this.players);
      this.cdr.detectChanges();
    }
  }

  handleIncomingMessage(data: { user: string, message: string, playerId: number, isFromDm: boolean }) {
    console.log('Incoming message:', data);
    const pId = data.playerId;
    if (!this.chats[pId]) {
      this.chats[pId] = [];
      this.unreadCounts[pId] = 0;
    }

    // Create new array reference for change detection
    this.chats[pId] = [...this.chats[pId], data];

    // If we are not currently viewing this player, increment unread
    // If we are viewing them, we don't need to increment.
    // However, if the message is from the DM (us), we definitely don't increment unread.
    if (!data.isFromDm && this.selectedPlayerId !== pId) {
        this.unreadCounts[pId] = (this.unreadCounts[pId] || 0) + 1;
    }
    
    console.log('Updated chats for player', pId, ':', this.chats[pId]);
    this.cdr.detectChanges();
  }

  selectPlayer(playerId: number) {
    this.selectedPlayerId = playerId;
    this.unreadCounts[playerId] = 0; // Clear unread on selection
  }

  sendMessage() {
    if (this.newMessage.trim() && this.selectedPlayerId) {
      // Updated signature: user and isDm are ignored by service/backend
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
    const messages = this.chats[this.selectedPlayerId] || [];
    // Auto-scroll to bottom after a brief delay to allow DOM update
    setTimeout(() => this.scrollToBottom(), 100);
    return messages;
  }

  private scrollToBottom() {
    const chatContainer = document.querySelector('.card-body[style*="overflow-y"]');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }

  getSelectedPlayerName(): string {
    const player = this.players.find(p => p.id === this.selectedPlayerId);
    return player ? player.characterName : '';
  }

  trackByPlayerId(index: number, player: any): number {
    return player.id;
  }

  trackByMessageIndex(index: number, msg: any): number {
    return index;
  }
}
