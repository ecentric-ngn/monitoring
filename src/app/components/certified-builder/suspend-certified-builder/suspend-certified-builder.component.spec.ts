import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuspendCertifiedBuilderComponent } from './suspend-certified-builder.component';

describe('SuspendCertifiedBuilderComponent', () => {
  let component: SuspendCertifiedBuilderComponent;
  let fixture: ComponentFixture<SuspendCertifiedBuilderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SuspendCertifiedBuilderComponent]
    });
    fixture = TestBed.createComponent(SuspendCertifiedBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
