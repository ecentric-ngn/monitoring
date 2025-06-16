import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelledSpecializedTradeComponent } from './cancelled-specialized-trade.component';

describe('CancelledSpecializedTradeComponent', () => {
  let component: CancelledSpecializedTradeComponent;
  let fixture: ComponentFixture<CancelledSpecializedTradeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CancelledSpecializedTradeComponent]
    });
    fixture = TestBed.createComponent(CancelledSpecializedTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
