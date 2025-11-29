import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './theme.service';

@Component({
  selector: 'app-root',
  template: '<router-outlet></router-outlet>',
  standalone: true,
  imports: [RouterModule]
})
export class AppComponent implements OnInit {
  constructor(private themeService: ThemeService) {}

  ngOnInit(): void {
    // Initialize theme on app load
    const savedTheme = localStorage.getItem('defaultTheme') as any;
    if (savedTheme && ['neutral', 'paranoia', 'dnd'].includes(savedTheme)) {
      this.themeService.setTheme(savedTheme, true);
    } else {
      this.themeService.setTheme('neutral', true);
    }
  }
}
