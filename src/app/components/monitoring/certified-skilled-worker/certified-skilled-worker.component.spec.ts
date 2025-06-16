import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifiedSkilledWorkerComponent } from './certified-skilled-worker.component';

describe('CertifiedSkilledWorkerComponent', () => {
  let component: CertifiedSkilledWorkerComponent;
  let fixture: ComponentFixture<CertifiedSkilledWorkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertifiedSkilledWorkerComponent]
    });
    fixture = TestBed.createComponent(CertifiedSkilledWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
