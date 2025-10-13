import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  
  constructor() { }

  // Este servicio está disponible para futuras expansiones de funcionalidad de traducción
  // Por ahora, cada componente maneja sus propias traducciones
}