import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedFirmComponent } from './specialized-firm.component';

describe('SpecializedFirmComponent', () => {
  let component: SpecializedFirmComponent;
  let fixture: ComponentFixture<SpecializedFirmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedFirmComponent]
    });
    fixture = TestBed.createComponent(SpecializedFirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
