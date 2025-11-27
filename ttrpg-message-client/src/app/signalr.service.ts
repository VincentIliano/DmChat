import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignalrService {
  private hubConnection: signalR.HubConnection;
  public messageReceived = new Subject<{ user: string, message: string }>();

  constructor() {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7038/chathub')
      .build();
  }

  public startConnection = (sessionId: string, playerId: number) => {
    this.hubConnection
      .start()
      .then(() => {
          console.log('Connection started');
          // Immediately invoke JoinSession after connecting
          this.hubConnection.invoke('JoinSession', sessionId, playerId)
            .catch(err => console.error('Error joining session:', err));
      })
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addMessageListener = () => {
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      this.messageReceived.next({ user, message });
    });
  }

  public sendMessage = (sessionId: string, user: string, message: string, playerId: number, isDm: boolean) => {
    this.hubConnection.invoke('SendMessage', sessionId, user, message, playerId, isDm)
      .catch(err => console.error(err));
  }
}
