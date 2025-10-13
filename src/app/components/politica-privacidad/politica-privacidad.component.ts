import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-politica-privacidad',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './politica-privacidad.component.html',
  styleUrls: ['./politica-privacidad.component.css']
})
export class PoliticaPrivacidadComponent implements OnInit {
  
  currentLanguage: 'es' | 'en' = 'es';

  translations = {
    es: {
      title: 'Política de Privacidad',
      subtitle: 'Hotel Paradise S.A. de C.V.',
      lastUpdated: 'Última actualización: 12 de octubre de 2025',
      backButton: 'Volver al Inicio',
      breadcrumb: 'Política de Privacidad',
      scrollTop: 'Ir arriba',
      copyright: '© 2025 Hotel Paradise S.A. de C.V. - Todos los derechos reservados',
      tableOfContents: 'Índice',
      sections: {
        section1: '1. Información que Recopilamos',
        section2: '2. Uso de la Información',
        section3: '3. Compartir Información',
        section4: '4. Seguridad de Datos',
        section5: '5. Cookies y Tecnologías',
        section6: '6. Derechos del Usuario',
        section7: '7. Retención de Datos',
        section8: '8. Menores de Edad',
        section9: '9. Transferencias Internacionales',
        section10: '10. Material Audiovisual',
        section11: '11. Eliminación Automática de Datos',
        section12: '12. Cambios a esta Política',
        section13: '13. Contacto'
      }
    },
    en: {
      title: 'Privacy Policy',
      subtitle: 'Hotel Paradise S.A. de C.V.',
      lastUpdated: 'Last updated: October 12, 2025',
      backButton: 'Back to Home',
      breadcrumb: 'Privacy Policy',
      scrollTop: 'Go to top',
      copyright: '© 2025 Hotel Paradise S.A. de C.V. - All rights reserved',
      tableOfContents: 'Table of Contents',
      sections: {
        section1: '1. Information We Collect',
        section2: '2. Use of Information',
        section3: '3. Information Sharing',
        section4: '4. Data Security',
        section5: '5. Cookies and Technologies',
        section6: '6. User Rights',
        section7: '7. Data Retention',
        section8: '8. Minors',
        section9: '9. International Transfers',
        section10: '10. Audiovisual Material',
        section11: '11. Automatic Data Deletion',
        section12: '12. Changes to this Policy',
        section13: '13. Contact'
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