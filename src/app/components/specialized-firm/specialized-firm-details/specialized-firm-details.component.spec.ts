import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedFirmDetailsComponent } from './specialized-firm-details.component';

describe('SpecializedFirmDetailsComponent', () => {
  let component: SpecializedFirmDetailsComponent;
  let fixture: ComponentFixture<SpecializedFirmDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedFirmDetailsComponent]
    });
    fixture = TestBed.createComponent(SpecializedFirmDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
