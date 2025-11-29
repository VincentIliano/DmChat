import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;
  public messageReceived = new Subject<{ user: string, message: string, playerId: number, isFromDm: boolean }>();
  public playerJoined = new Subject<{ id: number, characterName: string }>();
  private listenersRegistered = false;

  constructor() {
    const hubUrl = environment.apiUrl.replace('/api', '/chathub');
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect() // Enable automatic reconnect
      .build();
    
    // Register listeners once when service is created
    this.registerListeners();
  }

  public startConnection = (sessionId: string, playerId: number) => {
      console.log('Starting Player Connection for session:', sessionId, 'Player:', playerId);
      this.ensureConnection().then(() => {
          console.log('Connection established. Joining session...');
          this.hubConnection.invoke('JoinSession', sessionId, playerId)
            .then(() => console.log('Joined session successfully'))
            .catch(err => console.error('Error joining session:', err));
      }).catch(err => console.error('Connection failed', err));
  }

  public startDmConnection = (sessionId: string) => {
      console.log('Starting DM Connection for session:', sessionId);
      this.ensureConnection().then(() => {
          console.log('Connection established. Registering DM...');
          this.hubConnection.invoke('RegisterDmConnection', sessionId)
            .then(() => console.log('DM Registered successfully'))
            .catch(err => console.error('Error registering DM connection:', err));
      }).catch(err => console.error('Connection failed', err));
  }

  private ensureConnection(): Promise<void> {
      if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
          return Promise.resolve();
      }
      if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
          console.log('Hub disconnected, starting...');
          // Ensure listeners are registered before starting
          this.registerListeners();
          return this.hubConnection.start()
            .then(() => {
              console.log('Hub started successfully');
              console.log('Connection state:', this.hubConnection.state);
            })
            .catch(err => {
              console.error('Hub start failed:', err);
              throw err;
            });
      }
      // If connecting, wait for it to complete
      if (this.hubConnection.state === signalR.HubConnectionState.Connecting) {
          return new Promise((resolve, reject) => {
              const checkState = () => {
                  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
                      resolve();
                  } else if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
                      reject('Connection failed');
                  } else {
                      setTimeout(checkState, 100);
                  }
              };
              checkState();
          });
      }
      return Promise.reject('Connection is in unexpected state: ' + this.hubConnection.state);
  }

  private registerListeners = () => {
    if (this.listenersRegistered) return;
    
    this.hubConnection.on('ReceiveMessage', (user, message, playerId, isFromDm) => {
      console.log('SignalR ReceiveMessage:', user, message, playerId, isFromDm);
      this.messageReceived.next({ user, message, playerId, isFromDm });
    });

    this.hubConnection.on('PlayerJoined', (data: { id: number, characterName: string }) => {
      console.log('SignalR PlayerJoined:', data);
      this.playerJoined.next(data);
    });
    
    this.listenersRegistered = true;
  }

  public addMessageListener = () => {
    // Deprecated: Listeners are now registered automatically
    // Kept for backward compatibility
    this.registerListeners();
  }

  public sendMessage = (sessionId: string, user: string, message: string, playerId: number, isDm: boolean) => {
      // Backend signature: SendMessage(string sessionId, string message, int targetPlayerId, string customSenderName = null)
      // For DMs, pass the custom sender name (user parameter). For players, it's ignored.
      const customName = isDm ? user : null;
      
      this.hubConnection.invoke('SendMessage', sessionId, message, playerId, customName)
        .catch(err => console.error('Error sending message:', err));
  }
}
