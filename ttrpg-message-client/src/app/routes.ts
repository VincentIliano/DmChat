import { Routes } from '@angular/router';
import { AuthComponent } from './auth/auth.component';
import { JoinSessionComponent } from './join-session/join-session.component';
import { ChatComponent } from './chat/chat.component';
import { DmDashboardComponent } from './dm-dashboard/dm-dashboard.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'join-session', component: JoinSessionComponent },
  { path: 'chat/:sessionId', component: ChatComponent },
  { path: 'dm-dashboard', component: DmDashboardComponent }
];
