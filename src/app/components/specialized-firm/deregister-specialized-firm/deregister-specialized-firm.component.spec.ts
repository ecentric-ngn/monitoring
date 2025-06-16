import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeregisterSpecializedFirmComponent } from './deregister-specialized-firm.component';

describe('DeregisterSpecializedFirmComponent', () => {
  let component: DeregisterSpecializedFirmComponent;
  let fixture: ComponentFixture<DeregisterSpecializedFirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeregisterSpecializedFirmComponent]
    });
    fixture = TestBed.createComponent(DeregisterSpecializedFirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
