import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;
  public messageReceived = new Subject<{ user: string, message: string, playerId: number, isFromDm: boolean }>();
  public playerJoined = new Subject<{ id: number, characterName: string }>();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7038/chathub', {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .build();
  }

  public startConnection = (sessionId: string, playerId: number) => {
      this.ensureConnection().then(() => {
          this.hubConnection.invoke('JoinSession', sessionId, playerId)
            .catch(err => console.error('Error joining session:', err));
      }).catch(err => console.error('Connection failed', err));
  }

  public startDmConnection = (sessionId: string) => {
      this.ensureConnection().then(() => {
          this.hubConnection.invoke('RegisterDmConnection', sessionId)
            .catch(err => console.error('Error registering DM connection:', err));
      }).catch(err => console.error('Connection failed', err));
  }

  private ensureConnection(): Promise<void> {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
          return Promise.resolve();
      }
      if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
          return this.hubConnection.start();
      }
      // If connecting, wait a bit or reject? For now, we assume simple retry or let the caller handle it.
      // A robust implementation would wait for the connecting state to resolve.
      return Promise.reject('Connection is in intermediate state: ' + this.hubConnection.state);
  }

  public addMessageListener = () => {
    this.hubConnection.on('ReceiveMessage', (user, message, playerId, isFromDm) => {
      this.messageReceived.next({ user, message, playerId, isFromDm });
    });

    this.hubConnection.on('PlayerJoined', (data: { id: number, characterName: string }) => {
      this.playerJoined.next(data);
    });
  }

  public sendMessage = (sessionId: string, user: string, message: string, playerId: number, isDm: boolean) => {
      // Logic fix: The backend now determines user/isDm. We just send content and target.
      // But we need to match the backend signature.
      // Backend: SendMessage(string sessionId, string message, int targetPlayerId)

      this.hubConnection.invoke('SendMessage', sessionId, message, playerId)
        .catch(err => console.error(err));
  }
}
