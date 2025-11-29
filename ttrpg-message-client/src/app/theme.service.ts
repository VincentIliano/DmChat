import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Theme = 'neutral' | 'paranoia' | 'dnd';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSubject = new BehaviorSubject<Theme>('neutral');
  public currentTheme$: Observable<Theme> = this.currentThemeSubject.asObservable();

  private sessionThemes: Map<number, Theme> = new Map();

  constructor() {
    // Load theme from localStorage on init
    const savedTheme = localStorage.getItem('defaultTheme') as Theme;
    if (savedTheme && ['neutral', 'paranoia', 'dnd'].includes(savedTheme)) {
      this.setTheme(savedTheme, true);
    }
  }

  setTheme(theme: Theme, skipStorage = false): void {
    this.currentThemeSubject.next(theme);
    this.applyTheme(theme);
    
    if (!skipStorage) {
      localStorage.setItem('defaultTheme', theme);
    }
  }

  setSessionTheme(sessionId: number, theme: Theme): void {
    this.sessionThemes.set(sessionId, theme);
    // Store in localStorage
    const themes = JSON.parse(localStorage.getItem('sessionThemes') || '{}');
    themes[sessionId] = theme;
    localStorage.setItem('sessionThemes', JSON.stringify(themes));
    
    this.setTheme(theme);
  }

  getSessionTheme(sessionId: number): Theme {
    // Check memory first
    if (this.sessionThemes.has(sessionId)) {
      return this.sessionThemes.get(sessionId)!;
    }
    
    // Check localStorage
    const themes = JSON.parse(localStorage.getItem('sessionThemes') || '{}');
    if (themes[sessionId]) {
      this.sessionThemes.set(sessionId, themes[sessionId]);
      return themes[sessionId];
    }
    
    // Return default
    return this.currentThemeSubject.value;
  }

  private applyTheme(theme: Theme): void {
    const body = document.body;
    body.className = body.className.replace(/theme-\w+/g, '');
    body.classList.add(`theme-${theme}`);
  }

  getCurrentTheme(): Theme {
    return this.currentThemeSubject.value;
  }
}

