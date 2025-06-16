import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedFirmsInfoComponent } from './specialized-firms-info.component';

describe('SpecializedFirmsInfoComponent', () => {
  let component: SpecializedFirmsInfoComponent;
  let fixture: ComponentFixture<SpecializedFirmsInfoComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedFirmsInfoComponent]
    });
    fixture = TestBed.createComponent(SpecializedFirmsInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
