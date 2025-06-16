import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HumanResourceComponent } from './human-resource.component';

describe('HumanResourceComponent', () => {
  let component: HumanResourceComponent;
  let fixture: ComponentFixture<HumanResourceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HumanResourceComponent]
    });
    fixture = TestBed.createComponent(HumanResourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
