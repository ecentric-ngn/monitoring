import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchitectRecordComponent } from './architect-record.component';

describe('ArchitectRecordComponent', () => {
  let component: ArchitectRecordComponent;
  let fixture: ComponentFixture<ArchitectRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ArchitectRecordComponent]
    });
    fixture = TestBed.createComponent(ArchitectRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
