import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DmChatComponent } from './dm-chat.component';
import { SessionService } from '../session.service';
import { SignalrService } from '../signalr.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('DmChatComponent', () => {
  let component: DmChatComponent;
  let fixture: ComponentFixture<DmChatComponent>;
  let mockSessionService: any;
  let mockSignalrService: any;
  let messageReceivedSubject: Subject<any>;
  let playerJoinedSubject: Subject<any>;

  beforeEach(async () => {
    mockSessionService = {
      getPlayers: vi.fn().mockReturnValue(of([{ id: 1, characterName: 'Player 1' }]))
    };

    messageReceivedSubject = new Subject<any>();
    playerJoinedSubject = new Subject<any>();

    mockSignalrService = {
      startDmConnection: vi.fn(),
      addMessageListener: vi.fn(),
      sendMessage: vi.fn(),
      messageReceived: messageReceivedSubject,
      playerJoined: playerJoinedSubject
    };

    await TestBed.configureTestingModule({
      imports: [DmChatComponent, CommonModule, FormsModule],
      providers: [
        { provide: SessionService, useValue: mockSessionService },
        { provide: SignalrService, useValue: mockSignalrService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } }
          }
        },
        { provide: ChangeDetectorRef, useValue: { detectChanges: vi.fn() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DmChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load players on init', () => {
    expect(mockSessionService.getPlayers).toHaveBeenCalledWith(1);
    expect(component.players.length).toBe(1);
    expect(component.players[0].characterName).toBe('Player 1');
    expect(component.chats[1]).toBeDefined();
  });

  it('should start DM connection and add listeners on init', () => {
    // Component initialization happens in ngOnInit which is called by detectChanges in beforeEach
    // The startDmConnection should have been called during component initialization
    expect(mockSignalrService.startDmConnection).toHaveBeenCalledWith('1');
    // Note: addMessageListener is no longer called explicitly as listeners are registered in service constructor
  });

  it('should handle player joined event', () => {
    const newPlayer = { id: 2, characterName: 'Player 2' };
    playerJoinedSubject.next(newPlayer);

    expect(component.players.length).toBe(2);
    expect(component.players[1].characterName).toBe('Player 2');
    expect(component.chats[2]).toBeDefined();
  });

  it('should handle incoming message', () => {
    const message = { user: 'Player 1', message: 'Hello', playerId: 1, isFromDm: false };
    messageReceivedSubject.next(message);

    expect(component.chats[1].length).toBe(1);
    expect(component.chats[1][0].message).toBe('Hello');
    expect(component.unreadCounts[1]).toBe(1);
  });

  it('should clear unread count when player is selected', () => {
    const message = { user: 'Player 1', message: 'Hello', playerId: 1, isFromDm: false };
    messageReceivedSubject.next(message);
    expect(component.unreadCounts[1]).toBe(1);

    component.selectPlayer(1);
    expect(component.selectedPlayerId).toBe(1);
    expect(component.unreadCounts[1]).toBe(0);
  });

  it('should handle error when loading players', () => {
      // Re-configure to throw error
      mockSessionService.getPlayers.mockReturnValue(throwError(() => new Error('API Error')));

      // Re-create component to trigger ngOnInit
      fixture = TestBed.createComponent(DmChatComponent);
      component = fixture.componentInstance;

      // Should not crash
      expect(() => fixture.detectChanges()).not.toThrow();
      // Players should be empty
      expect(component.players).toEqual([]);
  });
});
