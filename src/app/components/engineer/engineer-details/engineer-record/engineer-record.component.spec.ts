import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineerRecordComponent } from './engineer-record.component';

describe('EngineerRecordComponent', () => {
  let component: EngineerRecordComponent;
  let fixture: ComponentFixture<EngineerRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EngineerRecordComponent]
    });
    fixture = TestBed.createComponent(EngineerRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
