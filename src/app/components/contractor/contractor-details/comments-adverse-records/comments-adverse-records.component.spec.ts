import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentsAdverseRecordsComponent } from './comments-adverse-records.component';

describe('CommentsAdverseRecordsComponent', () => {
  let component: CommentsAdverseRecordsComponent;
  let fixture: ComponentFixture<CommentsAdverseRecordsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommentsAdverseRecordsComponent]
    });
    fixture = TestBed.createComponent(CommentsAdverseRecordsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
