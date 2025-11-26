import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JoinSessionComponent } from './join-session.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('JoinSessionComponent', () => {
  let component: JoinSessionComponent;
  let fixture: ComponentFixture<JoinSessionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinSessionComponent, HttpClientTestingModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(JoinSessionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
