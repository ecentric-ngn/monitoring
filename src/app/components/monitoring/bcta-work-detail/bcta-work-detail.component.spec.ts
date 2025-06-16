import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BctaWorkDetailComponent } from './bcta-work-detail.component';

describe('BctaWorkDetailComponent', () => {
  let component: BctaWorkDetailComponent;
  let fixture: ComponentFixture<BctaWorkDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BctaWorkDetailComponent]
    });
    fixture = TestBed.createComponent(BctaWorkDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
