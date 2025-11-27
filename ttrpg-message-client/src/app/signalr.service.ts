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

  public startConnection = () => {
  private hubConnection: signalR.HubConnection = null!;
  public messageReceived = new Subject<{ user: string, message: string }>();

  constructor() { }

  public startConnection = (sessionId: string) => {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`https://localhost:7038/chathub?sessionId=${sessionId}`)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('Connection started'))
      .catch(err => console.log('Error while starting connection: ' + err));
  }

  public addMessageListener = () => {
    this.hubConnection.on('ReceiveMessage', (user, message) => {
      this.messageReceived.next({ user, message });
    });
  }

  public sendMessage = (sessionId: string, user: string, message: string) => {
    this.hubConnection.invoke('SendMessage', sessionId, user, message)
  public sendMessage = (user: string, message: string) => {
    this.hubConnection.invoke('SendMessage', user, message)
      .catch(err => console.error(err));
  }
}
