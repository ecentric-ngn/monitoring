import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CertifiedBuildersComponent } from './certified-builders.component';

describe('CertifiedBuildersComponent', () => {
  let component: CertifiedBuildersComponent;
  let fixture: ComponentFixture<CertifiedBuildersComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertifiedBuildersComponent]
    });
    fixture = TestBed.createComponent(CertifiedBuildersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
