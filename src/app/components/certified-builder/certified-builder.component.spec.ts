import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifiedBuilderComponent } from './certified-builder.component';

describe('CertifiedBuilderComponent', () => {
  let component: CertifiedBuilderComponent;
  let fixture: ComponentFixture<CertifiedBuilderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertifiedBuilderComponent]
    });
    fixture = TestBed.createComponent(CertifiedBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
