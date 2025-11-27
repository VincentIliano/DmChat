import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.html',
  standalone: true,
  imports: [CommonModule]
})
export class LandingComponent {
  constructor(private router: Router) { }

  goToDmLogin() {
    this.router.navigate(['/auth']);
  }

  goToJoinSession() {
    this.router.navigate(['/join-session']);
  }
}
