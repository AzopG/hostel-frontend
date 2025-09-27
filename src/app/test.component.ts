import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `
    <div style="text-align: center; padding: 50px; font-family: Arial;">
      <h1 style="color: #2196F3;">🏨 Hotel Paradise - TEST</h1>
      <p style="font-size: 18px;">Si ves esto, Angular está funcionando correctamente!</p>
      <p style="color: #666;">Servidor corriendo en puerto 4200</p>
    </div>
  `
})
export class TestComponent { }