import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecializedTradeRecordComponent } from './specialized-trade-record.component';

describe('SpecializedTradeRecordComponent', () => {
  let component: SpecializedTradeRecordComponent;
  let fixture: ComponentFixture<SpecializedTradeRecordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SpecializedTradeRecordComponent]
    });
    fixture = TestBed.createComponent(SpecializedTradeRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
