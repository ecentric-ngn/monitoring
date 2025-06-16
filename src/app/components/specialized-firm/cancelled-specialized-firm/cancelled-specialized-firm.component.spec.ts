import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledSpecializedFirmComponent } from './cancelled-specialized-firm.component';

describe('CancelledSpecializedFirmComponent', () => {
  let component: CancelledSpecializedFirmComponent;
  let fixture: ComponentFixture<CancelledSpecializedFirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledSpecializedFirmComponent]
    });
    fixture = TestBed.createComponent(CancelledSpecializedFirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
