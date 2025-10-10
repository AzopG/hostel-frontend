import { Component } from '@angular/core';
import { PanelOcupacionComponent } from '../panel-ocupacion/panel-ocupacion.component';

@Component({
  selector: 'app-panel-ocupacion-dashboard',
  standalone: true,
  imports: [PanelOcupacionComponent],
  template: `
    <div class="ocupacion-dashboard-container">
      <div class="dashboard-header">
        <div class="header-content">
          <div class="icon-wrapper">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="header-text">
            <h2 class="dashboard-title">Panel Consolidado de Ocupación</h2>
            <p class="dashboard-subtitle">Monitoreo en tiempo real de ocupación por sede</p>
          </div>
        </div>
        <div class="header-decoration"></div>
      </div>
      
      <div class="dashboard-content">
        <app-panel-ocupacion></app-panel-ocupacion>
      </div>
    </div>
  `,
  styles: [`
    .ocupacion-dashboard-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      padding: 2rem;
      font-family: 'Playfair Display', 'Georgia', serif;
    }

    .dashboard-header {
      background: linear-gradient(135deg, rgba(248, 241, 233, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 2.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 20px 60px rgba(28, 37, 38, 0.1);
      border: 2px solid rgba(184, 151, 120, 0.2);
      position: relative;
      overflow: hidden;
    }

    .dashboard-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #B89778 0%, #4A1B2F 50%, #1C2526 100%);
      border-radius: 20px 20px 0 0;
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }

    .icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #B89778 0%, #4A1B2F 100%);
      border-radius: 50%;
      color: #F8F1E9;
      font-size: 2rem;
      box-shadow: 0 8px 25px rgba(184, 151, 120, 0.4);
      position: relative;
    }

    .icon-wrapper::after {
      content: '';
      position: absolute;
      top: -3px;
      left: -3px;
      right: -3px;
      bottom: -3px;
      background: linear-gradient(135deg, #B89778, #4A1B2F, #1C2526);
      border-radius: 50%;
      z-index: -1;
      opacity: 0.3;
    }

    .icon-wrapper i {
      filter: drop-shadow(0 0 8px rgba(248, 241, 233, 0.3));
    }

    .header-text {
      flex: 1;
    }

    .dashboard-title {
      color: #1C2526;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
      letter-spacing: 1px;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
      font-family: 'Playfair Display', serif;
    }

    .dashboard-subtitle {
      color: #4A1B2F;
      font-size: 1.1rem;
      font-weight: 500;
      margin: 0;
      opacity: 0.9;
      letter-spacing: 0.5px;
      font-family: 'Crimson Text', serif;
    }

    .header-decoration {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 100px;
      height: 100px;
      background: radial-gradient(circle, rgba(184, 151, 120, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      z-index: 1;
    }

    .dashboard-content {
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(15px);
      border-radius: 20px;
      padding: 0;
      box-shadow: 0 15px 40px rgba(28, 37, 38, 0.08);
      border: 1px solid rgba(184, 151, 120, 0.15);
      overflow: hidden;
      position: relative;
    }

    .dashboard-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent 0%, #B89778 50%, transparent 100%);
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .ocupacion-dashboard-container {
        padding: 1rem;
      }

      .dashboard-header {
        padding: 2rem 1.5rem;
        margin-bottom: 1.5rem;
      }

      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }

      .icon-wrapper {
        width: 60px;
        height: 60px;
        font-size: 1.5rem;
      }

      .dashboard-title {
        font-size: 2rem;
      }

      .dashboard-subtitle {
        font-size: 1rem;
      }
    }

    @media (max-width: 480px) {
      .ocupacion-dashboard-container {
        padding: 0.5rem;
      }

      .dashboard-header {
        padding: 1.5rem 1rem;
        border-radius: 15px;
      }

      .dashboard-title {
        font-size: 1.8rem;
      }

      .dashboard-subtitle {
        font-size: 0.95rem;
      }

      .dashboard-content {
        border-radius: 15px;
      }
    }

    /* Animaciones */
    .icon-wrapper {
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }

    .dashboard-header {
      animation: slideInDown 0.6s ease-out;
    }

    .dashboard-content {
      animation: slideInUp 0.6s ease-out 0.2s both;
    }

    @keyframes slideInDown {
      from {
        opacity: 0;
        transform: translateY(-30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Efectos hover */
    .dashboard-header:hover .icon-wrapper {
      transform: scale(1.05) translateY(-2px);
      box-shadow: 0 12px 35px rgba(184, 151, 120, 0.6);
    }

    .dashboard-header:hover .dashboard-title {
      color: #4A1B2F;
    }
  `]
})
export class PanelOcupacionDashboardComponent {}
