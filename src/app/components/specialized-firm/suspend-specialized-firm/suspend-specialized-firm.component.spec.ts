import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendSpecializedFirmComponent } from './suspend-specialized-firm.component';

describe('SuspendSpecializedFirmComponent', () => {
  let component: SuspendSpecializedFirmComponent;
  let fixture: ComponentFixture<SuspendSpecializedFirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendSpecializedFirmComponent]
    });
    fixture = TestBed.createComponent(SuspendSpecializedFirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
