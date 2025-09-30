import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComprobanteReservaComponent } from './comprobante-reserva.component';

describe('ComprobanteReservaComponent', () => {
  let component: ComprobanteReservaComponent;
  let fixture: ComponentFixture<ComprobanteReservaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ComprobanteReservaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ComprobanteReservaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
