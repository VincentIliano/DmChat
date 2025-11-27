import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DmDashboardComponent } from './dm-dashboard.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DmDashboardComponent', () => {
  let component: DmDashboardComponent;
  let fixture: ComponentFixture<DmDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DmDashboardComponent, HttpClientTestingModule]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DmDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
