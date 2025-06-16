import { TestBed } from '@angular/core/testing';
import { AuthServiceService } from './auth.service';

describe('AuthService', () => {
  let service: AuthServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
