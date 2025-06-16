import { TestBed } from '@angular/core/testing';

import { UserTrainingService } from './user-training.service';

describe('UserTrainingService', () => {
  let service: UserTrainingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserTrainingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
