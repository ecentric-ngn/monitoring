import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecilizedFirmDetailsComponent } from './specilized-firm-details.component';

describe('SpecilizedFirmDetailsComponent', () => {
  let component: SpecilizedFirmDetailsComponent;
  let fixture: ComponentFixture<SpecilizedFirmDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecilizedFirmDetailsComponent]
    });
    fixture = TestBed.createComponent(SpecilizedFirmDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
