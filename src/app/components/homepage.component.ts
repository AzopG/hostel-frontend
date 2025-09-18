import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  animations: [
    trigger('fadeInUp', [
      state('in', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate(600)
      ])
    ]),
    trigger('slideIn', [
      state('in', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('void => *', [
        style({ opacity: 0, transform: 'translateX(-50px)' }),
        animate(800)
      ])
    ])
  ],
  template: `
    <div class="homepage">
      <!-- Hero Section -->
      <section class="hero" [@fadeInUp]>
        <div class="hero-content">
          <div class="hero-text">
            <h1 class="hero-title">
              🏨 <span class="gradient-text">Hotel Paradise</span>
            </h1>
            <p class="hero-subtitle">
              Experiencia hotelera excepcional con servicios de lujo y comodidad incomparable
            </p>
            <div class="hero-features">
              <div class="feature-item">
                <span class="feature-icon">🌟</span>
                <span>Servicio Premium</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🏊‍♀️</span>
                <span>Instalaciones de Lujo</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🍽️</span>
                <span>Gastronomía Exclusiva</span>
              </div>
            </div>
            <div class="hero-actions">
              <button class="btn-primary" (click)="navigateToLogin()">
                <span class="btn-icon">🏨</span>
                Gestión Hotelera
              </button>
              <button class="btn-secondary" (click)="exploreFeatures()">
                <span class="btn-icon">🏖️</span>
                Ver Servicios
              </button>
            </div>
          </div>
          <div class="hero-visual">
            <div class="floating-card" [@slideIn]>
              <div class="card-header">
                <h3>Panel de Control</h3>
                <div class="status-indicator active"></div>
              </div>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-number">{{ stats.hoteles }}</div>
                  <div class="stat-label">Hoteles</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ stats.reservas }}</div>
                  <div class="stat-label">Reservas</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ stats.usuarios }}</div>
                  <div class="stat-label">Usuarios</div>
                </div>
                <div class="stat-item">
                  <div class="stat-number">{{ stats.ingresos }}</div>
                  <div class="stat-label">Revenue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Services Section -->
      <section class="features" [@fadeInUp]>
        <div class="container">
          <h2 class="section-title">Nuestros Servicios</h2>
          <div class="features-grid">
            
            <!-- Reservas -->
            <div class="feature-card" (click)="navigateToLogin()">
              <div class="feature-icon-large">🏨</div>
              <h3>Gestión de Reservas</h3>
              <p>Sistema completo para administrar reservas de habitaciones, salones de eventos y servicios especiales.</p>
              <div class="service-highlights">
                <span class="service-tag">Reservas Online</span>
                <span class="service-tag">Check-in Digital</span>
                <span class="service-tag">Cancelación Flexible</span>
              </div>
              <div class="feature-action">
                <span class="action-text">Gestionar Reservas</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

            <!-- Habitaciones -->
            <div class="feature-card" (click)="navigateToLogin()">
              <div class="feature-icon-large">�️</div>
              <h3>Habitaciones de Lujo</h3>
              <p>Variedad de habitaciones desde estándar hasta suites presidenciales con todas las comodidades modernas.</p>
              <div class="service-highlights">
                <span class="service-tag">Wi-Fi Premium</span>
                <span class="service-tag">Room Service 24/7</span>
                <span class="service-tag">Vista al Mar</span>
              </div>
              <div class="feature-action">
                <span class="action-text">Ver Habitaciones</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

            <!-- Ubicaciones -->
            <div class="feature-card" (click)="navigateToMaps()">
              <div class="feature-icon-large">🗺️</div>
              <h3>Ubicaciones Privilegiadas</h3>
              <p>Hoteles estratégicamente ubicados en las mejores zonas turísticas y centros de negocios.</p>
              <div class="service-highlights">
                <span class="service-tag">Centro Ciudad</span>
                <span class="service-tag">Frente al Mar</span>
                <span class="service-tag">Zona Turística</span>
              </div>
              <div class="feature-action">
                <span class="action-text">Ver Ubicaciones</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

            <!-- Eventos -->
            <div class="feature-card" (click)="navigateToLogin()">
              <div class="feature-icon-large">🎉</div>
              <h3>Salones de Eventos</h3>
              <p>Spaces ideales para bodas, conferencias, celebraciones corporativas y eventos sociales especiales.</p>
              <div class="service-highlights">
                <span class="service-tag">Capacidad Flexible</span>
                <span class="service-tag">Catering Gourmet</span>
                <span class="service-tag">Tecnología AV</span>
              </div>
              <div class="feature-action">
                <span class="action-text">Reservar Salón</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

            <!-- Reportes -->
            <div class="feature-card" (click)="navigateToAnalytics()">
              <div class="feature-icon-large">📊</div>
              <h3>Análisis de Ocupación</h3>
              <p>Monitoreo en tiempo real de ocupación, satisfacción del cliente y rendimiento operativo.</p>
              <div class="service-highlights">
                <span class="service-tag">Dashboard Ejecutivo</span>
                <span class="service-tag">Métricas KPI</span>
                <span class="service-tag">Reportes Automáticos</span>
              </div>
              <div class="feature-action">
                <span class="action-text">Ver Estadísticas</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

            <!-- Servicios Premium -->
            <div class="feature-card" (click)="navigateToLogin()">
              <div class="feature-icon-large">⭐</div>
              <h3>Servicios Premium</h3>
              <p>Spa, gimnasio, restaurantes gourmet, servicio de conserjería y experiencias personalizadas.</p>
              <div class="service-highlights">
                <span class="service-tag">Spa & Wellness</span>
                <span class="service-tag">Fine Dining</span>
                <span class="service-tag">Concierge VIP</span>
              </div>
              <div class="feature-action">
                <span class="action-text">Explorar Servicios</span>
                <span class="action-arrow">→</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="cta" [@fadeInUp]>
        <div class="container">
          <div class="cta-content">
            <h2>¿Listo para una experiencia única?</h2>
            <p>Reserva ahora y disfruta de nuestros servicios de lujo con atención personalizada las 24 horas.</p>
            <button class="btn-primary large" (click)="navigateToLogin()">
              <span class="btn-icon">🏨</span>
              Hacer Reserva
            </button>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="footer">
        <div class="container">
          <div class="footer-content">
            <div class="footer-section">
              <h4>Hotel Paradise</h4>
              <p>Experiencia hotelera de lujo con atención personalizada y servicios excepcionales.</p>
            </div>
            <div class="footer-section">
              <h4>Contacto</h4>
              <ul>
                <li>📞 +1-800-PARADISE</li>
                <li>📧 reservas&#64;hotelparadise.com</li>
                <li>📍 Av. Costa Dorada 123</li>
                <li>🌐 www.hotelparadise.com</li>
              </ul>
            </div>
            <div class="footer-section">
              <h4>Servicios</h4>
              <ul>
                <li>🏨 Reservas Online</li>
                <li>🍽️ Restaurante Gourmet</li>
                <li>🏊‍♀️ Spa & Wellness</li>
                <li>🎉 Salones de Eventos</li>
              </ul>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2025 Hotel Paradise. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .homepage {
      min-height: 100vh;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }

    /* Hero Section */
    .hero {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100%" height="100%" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
    }

    .hero-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      position: relative;
      z-index: 2;
    }

    .hero-title {
      font-size: 4rem;
      font-weight: 800;
      color: white;
      margin: 0 0 1rem 0;
      line-height: 1.1;
    }

    .gradient-text {
      background: linear-gradient(45deg, #fff, #e3f2fd);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .hero-subtitle {
      font-size: 1.25rem;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .hero-features {
      display: flex;
      gap: 2rem;
      margin-bottom: 3rem;
      flex-wrap: wrap;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 500;
    }

    .feature-icon {
      font-size: 1.5rem;
    }

    .hero-actions {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 2rem;
      border: none;
      border-radius: 12px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
    }

    .btn-primary {
      background: white;
      color: #667eea;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }

    .btn-primary.large {
      padding: 1.25rem 2.5rem;
      font-size: 1.2rem;
    }

    .btn-icon {
      font-size: 1.2rem;
    }

    /* Floating Card */
    .floating-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .card-header h3 {
      margin: 0;
      color: #333;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #4caf50;
      position: relative;
    }

    .status-indicator.active::before {
      content: '';
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      background: #4caf50;
      opacity: 0.3;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.5); opacity: 0.1; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #666;
      font-weight: 500;
    }

    /* Features Section */
    .features {
      padding: 6rem 0;
      background: #f8fafc;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .section-title {
      text-align: center;
      font-size: 3rem;
      font-weight: 700;
      color: #1a202c;
      margin-bottom: 3rem;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      cursor: pointer;
      border: 1px solid #e2e8f0;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
      border-color: #667eea;
    }

    .feature-icon-large {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1a202c;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: #4a5568;
      line-height: 1.6;
      margin-bottom: 1.5rem;
    }

    .service-highlights {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }

    .service-tag {
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .feature-action {
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #667eea;
      font-weight: 600;
    }

    .action-arrow {
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    .feature-card:hover .action-arrow {
      transform: translateX(4px);
    }

    /* CTA Section */
    .cta {
      background: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
      padding: 6rem 0;
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.2rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2rem;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    /* Footer */
    .footer {
      background: #1a202c;
      color: white;
      padding: 3rem 0 1rem;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-section h4 {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #667eea;
    }

    .footer-section p {
      color: rgba(255, 255, 255, 0.7);
      line-height: 1.6;
    }

    .footer-section ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .footer-section li {
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
      transition: color 0.3s ease;
    }

    .footer-section li:hover {
      color: #667eea;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1rem;
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        text-align: center;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
      
      .hero-features {
        justify-content: center;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      
      .hero-actions {
        justify-content: center;
      }
      
      .section-title {
        font-size: 2rem;
      }
    }
  `]
})
export class HomepageComponent implements OnInit {
  private router = inject(Router);

  stats = {
    hoteles: 24,
    reservas: 156,
    usuarios: 89,
    ingresos: '$45K'
  };

  ngOnInit() {
    // Animate stats numbers
    this.animateStats();
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToAnalytics() {
    this.router.navigate(['/dashboard/analytics']);
  }

  navigateToMaterial() {
    this.router.navigate(['/dashboard/material-showcase']);
  }

  navigateToMaps() {
    this.router.navigate(['/dashboard/hotel-map']);
  }

  navigateToPerformance() {
    this.router.navigate(['/dashboard/performance-monitor']);
  }

  navigateToAnimations() {
    this.router.navigate(['/demos/animations']);
  }

  navigateToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  exploreFeatures() {
    // Smooth scroll to features section
    const featuresSection = document.querySelector('.features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  private animateStats() {
    const targetStats = {
      hoteles: 24,
      reservas: 156,
      usuarios: 89
    };

    // Animate numbers counting up
    Object.keys(targetStats).forEach(key => {
      let current = 0;
      const target = targetStats[key as keyof typeof targetStats];
      const increment = target / 50;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        this.stats = { ...this.stats, [key]: Math.floor(current) };
      }, 30);
    });
  }
}