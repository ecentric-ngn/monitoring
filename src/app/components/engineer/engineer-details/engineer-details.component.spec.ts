import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngineerDetailsComponent } from './engineer-details.component';

describe('EngineerDetailsComponent', () => {
  let component: EngineerDetailsComponent;
  let fixture: ComponentFixture<EngineerDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EngineerDetailsComponent]
    });
    fixture = TestBed.createComponent(EngineerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
