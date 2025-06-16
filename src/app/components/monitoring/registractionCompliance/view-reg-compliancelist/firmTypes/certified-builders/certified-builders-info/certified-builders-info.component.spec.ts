import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifiedBuildersInfoComponent } from './certified-builders-info.component';

describe('CertifiedBuildersInfoComponent', () => {
  let component: CertifiedBuildersInfoComponent;
  let fixture: ComponentFixture<CertifiedBuildersInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertifiedBuildersInfoComponent]
    });
    fixture = TestBed.createComponent(CertifiedBuildersInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
