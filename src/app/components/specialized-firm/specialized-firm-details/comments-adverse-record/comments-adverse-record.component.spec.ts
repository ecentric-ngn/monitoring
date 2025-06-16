import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsAdverseRecordComponent } from './comments-adverse-record.component';

describe('CommentsAdverseRecordComponent', () => {
  let component: CommentsAdverseRecordComponent;
  let fixture: ComponentFixture<CommentsAdverseRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsAdverseRecordComponent]
    });
    fixture = TestBed.createComponent(CommentsAdverseRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
