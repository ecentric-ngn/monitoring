import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewConultencyDetailsComponent } from './view-conultency-details.component';

describe('ViewConultencyDetailsComponent', () => {
  let component: ViewConultencyDetailsComponent;
  let fixture: ComponentFixture<ViewConultencyDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ViewConultencyDetailsComponent]
    });
    fixture = TestBed.createComponent(ViewConultencyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
