import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tratamiento-datos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tratamiento-datos.component.html',
  styleUrls: ['./tratamiento-datos.component.css']
})
export class TratamientoDatosComponent implements OnInit {
  
  currentLanguage: 'es' | 'en' = 'es';

  translations = {
    es: {
      title: 'Política de Tratamiento de Datos Personales',
      subtitle: 'Hotel Paradise S.A. de C.V.',
      lastUpdated: 'Última actualización: 12 de octubre de 2025',
      legalNotice: 'Aviso de Privacidad conforme a la LFPDPPP',
      backButton: 'Volver al Inicio',
      breadcrumb: 'Tratamiento de Datos',
      scrollTop: 'Ir arriba',
      copyright: '© 2025 Hotel Paradise S.A. de C.V. - Todos los derechos reservados',
      tableOfContents: 'Índice',
      sections: {
        section1: '1. Identidad y Domicilio del Responsable',
        section2: '2. Datos Personales que se Recaban',
        section3: '3. Finalidades del Tratamiento',
        section4: '4. Transferencias de Datos',
        section5: '5. Medidas de Seguridad',
        section6: '6. Derechos ARCO',
        section7: '7. Conservación de Datos',
        section8: '8. Uso de Cookies',
        section9: '9. Modificaciones al Aviso',
        section10: '10. Autoridad de Control',
        section11: '11. Contacto del DPO'
      },
      content: {
        section1: {
          title: 'Identificación del Responsable',
          responsible: 'Responsable del Tratamiento',
          companyInfo: 'Hotel Paradise S.A. de C.V., constituida como sociedad anónima de capital variable conforme a las leyes mexicanas, con domicilio fiscal ubicado en Calle Principal #123, Colonia Centro, Código Postal 45000, Belén, Jalisco, México.',
          taxInfo: 'Datos de Identificación Fiscal:',
          legalRep: 'Representante Legal:',
          mainActivity: 'Actividad Principal:',
          legalFramework: 'Marco Legal Aplicable',
          legalText: 'El presente aviso de privacidad se rige bajo las disposiciones de:'
        },
        section3: {
          title: 'Finalidades del Tratamiento',
          intro: 'Sus datos personales serán utilizados para las siguientes finalidades, clasificadas en primarias (necesarias para la prestación del servicio) y secundarias (que requieren su consentimiento):',
          primary: 'Finalidades Primarias (Necesarias)',
          secondary: 'Finalidades Secundarias (Requieren Consentimiento)',
          primaryText: 'Estas finalidades no requieren su consentimiento ya que son necesarias para la prestación de los servicios contratados:',
          secondaryText: 'Para estas finalidades solicitaremos su consentimiento expreso:'
        }
      }
    },
    en: {
      title: 'Personal Data Processing Policy',
      subtitle: 'Hotel Paradise S.A. de C.V.',
      lastUpdated: 'Last updated: October 12, 2025',
      legalNotice: 'Privacy Notice in accordance with LFPDPPP',
      backButton: 'Back to Home',
      breadcrumb: 'Data Processing',
      scrollTop: 'Go to top',
      copyright: '© 2025 Hotel Paradise S.A. de C.V. - All rights reserved',
      tableOfContents: 'Table of Contents',
      sections: {
        section1: '1. Identity and Address of Data Controller',
        section2: '2. Personal Data Collected',
        section3: '3. Processing Purposes',
        section4: '4. Data Transfers',
        section5: '5. Security Measures',
        section6: '6. ARCO Rights',
        section7: '7. Data Retention',
        section8: '8. Use of Cookies',
        section9: '9. Privacy Notice Changes',
        section10: '10. Control Authority',
        section11: '11. DPO Contact'
      },
      content: {
        section1: {
          title: 'Data Controller Identification',
          responsible: 'Data Controller',
          companyInfo: 'Hotel Paradise S.A. de C.V., incorporated as a variable capital corporation under Mexican law, with registered address at Calle Principal #123, Colonia Centro, Postal Code 45000, Belén, Jalisco, Mexico.',
          taxInfo: 'Tax Identification Data:',
          legalRep: 'Legal Representative:',
          mainActivity: 'Main Activity:',
          legalFramework: 'Applicable Legal Framework',
          legalText: 'This privacy notice is governed by the provisions of:'
        },
        section3: {
          title: 'Processing Purposes',
          intro: 'Your personal data will be used for the following purposes, classified as primary (necessary for service provision) and secondary (requiring your consent):',
          primary: 'Primary Purposes (Necessary)',
          secondary: 'Secondary Purposes (Require Consent)',
          primaryText: 'These purposes do not require your consent as they are necessary for providing the contracted services:',
          secondaryText: 'For these purposes we will request your express consent:'
        }
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