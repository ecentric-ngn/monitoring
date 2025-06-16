import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifiedBuilderDetailsComponent } from './certified-builder-details.component';

describe('CertifiedBuilderDetailsComponent', () => {
  let component: CertifiedBuilderDetailsComponent;
  let fixture: ComponentFixture<CertifiedBuilderDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertifiedBuilderDetailsComponent]
    });
    fixture = TestBed.createComponent(CertifiedBuilderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
