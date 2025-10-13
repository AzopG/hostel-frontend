import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terminos-condiciones',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terminos-condiciones.component.html',
  styleUrls: ['./terminos-condiciones.component.css']
})
export class TerminosCondicionesComponent implements OnInit {
  
  currentLanguage: 'es' | 'en' = 'es';

  translations = {
    es: {
      title: 'Términos y Condiciones',
      subtitle: 'Hotel Paradise S.A. de C.V.',
      lastUpdated: 'Última actualización: 12 de octubre de 2025',
      backButton: 'Volver al Inicio',
      breadcrumb: 'Términos y Condiciones',
      scrollTop: 'Ir arriba',
      copyright: '© 2025 Hotel Paradise S.A. de C.V. - Todos los derechos reservados',
      tableOfContents: 'Índice',
      sections: {
        section1: '1. Información General',
        section2: '2. Aceptación de Términos',
        section3: '3. Servicios Ofrecidos',
        section4: '4. Reservas y Cancelaciones',
        section5: '5. Políticas de Pago',
        section6: '6. Responsabilidades del Usuario',
        section7: '7. Limitación de Responsabilidad',
        section8: '8. Modificaciones',
        section9: '9. Contacto'
      }
    },
    en: {
      title: 'Terms and Conditions',
      subtitle: 'Hotel Paradise S.A. de C.V.',
      lastUpdated: 'Last updated: October 12, 2025',
      backButton: 'Back to Home',
      breadcrumb: 'Terms and Conditions',
      scrollTop: 'Go to top',
      copyright: '© 2025 Hotel Paradise S.A. de C.V. - All rights reserved',
      tableOfContents: 'Table of Contents',
      sections: {
        section1: '1. General Information',
        section2: '2. Acceptance of Terms',
        section3: '3. Services Offered',
        section4: '4. Reservations and Cancellations',
        section5: '5. Payment Policies',
        section6: '6. User Responsibilities',
        section7: '7. Limitation of Liability',
        section8: '8. Modifications',
        section9: '9. Contact'
      }
    }
  };
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Handle section navigation from URL
    this.handleSectionNavigation();
    
    // Add click event listeners to table of contents links
    this.setupSectionNavigation();
  }

  toggleLanguage() {
    this.currentLanguage = this.currentLanguage === 'es' ? 'en' : 'es';
  }

  getTranslation(key: string): string {
    const keys = key.split('.');
    let value: any = this.translations[this.currentLanguage];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private handleSectionNavigation() {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }

  private setupSectionNavigation() {
    setTimeout(() => {
      const tocLinks = document.querySelectorAll('.table-of-contents a[href^="#"]');
      tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = link.getAttribute('href');
          if (targetId) {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth' });
              // Update URL without triggering navigation
              window.history.pushState(null, '', targetId);
            }
          }
        });
      });
    }, 100);
  }
}