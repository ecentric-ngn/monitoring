import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultantTrackRecordComponent } from './consultant-track-record.component';

describe('ConsultantTrackRecordComponent', () => {
  let component: ConsultantTrackRecordComponent;
  let fixture: ComponentFixture<ConsultantTrackRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConsultantTrackRecordComponent]
    });
    fixture = TestBed.createComponent(ConsultantTrackRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
