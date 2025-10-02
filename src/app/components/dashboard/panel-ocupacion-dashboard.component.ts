import { Component } from '@angular/core';
import { PanelOcupacionComponent } from '../panel-ocupacion/panel-ocupacion.component';

@Component({
  selector: 'app-panel-ocupacion-dashboard',
  standalone: true,
  imports: [PanelOcupacionComponent],
  template: `
    <h2>Panel Consolidado de Ocupación</h2>
    <app-panel-ocupacion></app-panel-ocupacion>
  `
})
export class PanelOcupacionDashboardComponent {}
