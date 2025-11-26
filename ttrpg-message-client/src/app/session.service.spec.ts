import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('SessionService', () => {
  let service: SessionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
