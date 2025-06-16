import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedTradeDetailsComponent } from './specialized-trade-details.component';

describe('SpecializedTradeDetailsComponent', () => {
  let component: SpecializedTradeDetailsComponent;
  let fixture: ComponentFixture<SpecializedTradeDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedTradeDetailsComponent]
    });
    fixture = TestBed.createComponent(SpecializedTradeDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
