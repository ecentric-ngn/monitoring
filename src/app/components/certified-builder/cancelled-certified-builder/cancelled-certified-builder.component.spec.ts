import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledCertifiedBuilderComponent } from './cancelled-certified-builder.component';

describe('CancelledCertifiedBuilderComponent', () => {
  let component: CancelledCertifiedBuilderComponent;
  let fixture: ComponentFixture<CancelledCertifiedBuilderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledCertifiedBuilderComponent]
    });
    fixture = TestBed.createComponent(CancelledCertifiedBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
