import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { JoinSessionComponent } from './join-session/join-session.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'auth', component: AuthComponent },
  { path: 'join-session', component: JoinSessionComponent },
  { path: 'chat/:sessionId', component: ChatComponent }
];
