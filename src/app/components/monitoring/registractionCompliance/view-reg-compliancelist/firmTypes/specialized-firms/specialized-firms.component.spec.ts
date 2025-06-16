import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedFirmsComponent } from './specialized-firms.component';

describe('SpecializedFirmsComponent', () => {
  let component: SpecializedFirmsComponent;
  let fixture: ComponentFixture<SpecializedFirmsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedFirmsComponent]
    });
    fixture = TestBed.createComponent(SpecializedFirmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
