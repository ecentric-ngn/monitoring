import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifiedFirmDetailsComponent } from './certified-firm-details.component';

describe('CertifiedFirmDetailsComponent', () => {
  let component: CertifiedFirmDetailsComponent;
  let fixture: ComponentFixture<CertifiedFirmDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertifiedFirmDetailsComponent]
    });
    fixture = TestBed.createComponent(CertifiedFirmDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
