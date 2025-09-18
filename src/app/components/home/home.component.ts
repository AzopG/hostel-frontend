import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LoginComponent],
  template: `
    <nav class="navbar">
      <div class="navbar-brand">
        <img src="https://cdn-icons-png.flaticon.com/512/235/235861.png" alt="HotelChain" class="brand-icon" />
        <span>HotelChain</span>
      </div>
      <ul class="navbar-links">
        <li><a href="#servicios">Servicios</a></li>
        <li><a href="#hoteles">Hoteles</a></li>
        <li><a href="#contacto">Contacto</a></li>
        <li><button class="login-nav-btn" (click)="showLogin = true">Iniciar Sesión</button></li>
      </ul>
    </nav>

    <section class="hero">
      <div class="hero-content">
        <img src="https://cdn-icons-png.flaticon.com/512/235/235861.png" alt="Hotel" class="hero-icon animate-bounce" />
        <h1>Bienvenido al Sistema Hotelero</h1>
        <p>Gestiona hoteles, reservas, eventos y más desde un solo lugar. Descubre la mejor experiencia para tu empresa, hotel o como cliente.</p>
        <button class="hero-btn animate-pop" (click)="showLogin = true">Accede ahora</button>
      </div>
      <div class="hero-bg-anim"></div>
    </section>

    <section class="info-section" id="servicios">
      <h2>Servicios</h2>
      <div class="info-cards">
        <div class="info-card animate-fadein">
          <img src="https://cdn-icons-png.flaticon.com/512/2922/2922506.png" alt="Reservas" class="card-icon" />
          <h3>Reservas Online</h3>
          <p>Reserva habitaciones y salones de forma rápida y segura.</p>
        </div>
        <div class="info-card animate-fadein" style="animation-delay:0.2s;">
          <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Eventos" class="card-icon" />
          <h3>Gestión de Eventos</h3>
          <p>Organiza eventos empresariales y sociales en nuestros hoteles.</p>
        </div>
        <div class="info-card animate-fadein" style="animation-delay:0.4s;">
          <img src="https://cdn-icons-png.flaticon.com/512/1828/1828919.png" alt="Reportes" class="card-icon" />
          <h3>Reportes y Estadísticas</h3>
          <p>Accede a reportes detallados para la administración eficiente.</p>
        </div>
      </div>
    </section>

    <section class="info-section" id="hoteles">
      <h2>Nuestros Hoteles</h2>
      <div class="hoteles-list">
        <div class="hotel-card animate-fadein">
          <img src="https://cdn-icons-png.flaticon.com/512/235/235861.png" alt="Hotel Plaza" class="card-icon" />
          <h3>Hotel Plaza</h3>
          <p>Ubicado en el centro, ideal para negocios y turismo.</p>
        </div>
        <div class="hotel-card animate-fadein" style="animation-delay:0.2s;">
          <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Hotel Ejecutivo" class="card-icon" />
          <h3>Hotel Ejecutivo</h3>
          <p>Perfecto para eventos empresariales y conferencias.</p>
        </div>
        <div class="hotel-card animate-fadein" style="animation-delay:0.4s;">
          <img src="https://cdn-icons-png.flaticon.com/512/235/235861.png" alt="Hotel Resort" class="card-icon" />
          <h3>Hotel Resort</h3>
          <p>Disfruta de vacaciones familiares y actividades recreativas.</p>
        </div>
      </div>
    </section>

    <section class="info-section" id="contacto">
      <h2>Contacto</h2>
      <p>¿Tienes dudas? Escríbenos a <a href="mailto:info&#64;hotelchain.com">info&#64;hotelchain.com</a> o llama al +57 123 456 7890</p>
    </section>

    <footer class="footer">
      <p>&copy; 2025 HotelChain. Todos los derechos reservados.</p>
    </footer>

    <div class="modal-backdrop" *ngIf="showLogin" (click)="closeModal()"></div>
    <div class="login-modal" *ngIf="showLogin">
      <app-login (close)="closeModal()"></app-login>
      <button class="close-modal" (click)="closeModal()">&times;</button>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #f5f5f5;
    }
    .navbar {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 40px;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }
    .navbar-brand {
      display: flex;
      align-items: center;
      font-size: 1.7rem;
      font-weight: bold;
      letter-spacing: 2px;
      gap: 10px;
    }
    .brand-icon {
      width: 36px;
      height: 36px;
      margin-right: 0;
      vertical-align: middle;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    }
    .navbar-links {
      display: flex;
      gap: 30px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .navbar-links li {
      display: flex;
      align-items: center;
    }
    .navbar-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      transition: color 0.3s;
    }
    .navbar-links a:hover {
      color: #ffd700;
    }
    .login-nav-btn {
      background: white;
      color: #764ba2;
      border: none;
      border-radius: 5px;
      padding: 8px 22px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s, color 0.3s;
    }
    .login-nav-btn:hover {
      background: #f5f5f5;
      color: #667eea;
    }
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 70vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 120px 20px 40px 20px;
      position: relative;
    }
    .hero-content {
      z-index: 2;
      position: relative;
      max-width: 600px;
      margin: 0 auto;
      background: none;
    }
    .hero-icon {
      width: 96px;
      height: 96px;
      margin-bottom: 18px;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.18));
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .hero h1 {
      font-size: 2.7rem;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .hero p {
      font-size: 1.2rem;
      margin-bottom: 30px;
    }
    .hero-btn {
      background: white;
      color: #764ba2;
      border: none;
      border-radius: 5px;
      padding: 14px 38px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s, color 0.3s;
      margin-top: 10px;
    }
    .hero-btn:hover {
      background: #f5f5f5;
      color: #667eea;
    }
    .hero-bg-anim {
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      z-index: 1;
      pointer-events: none;
      background: radial-gradient(circle at 60% 40%, #fff3 0%, #764ba2 100%);
      opacity: 0.3;
      animation: bgmove 8s linear infinite alternate;
    }
    @keyframes bgmove {
      0% { background-position: 0% 0%; }
      100% { background-position: 100% 100%; }
    }
    .info-section {
      background: #fff;
      padding: 60px 20px;
      text-align: center;
      margin-top: 0;
    }
    .info-section h2 {
      font-size: 2.2rem;
      color: #764ba2;
      margin-bottom: 30px;
    }
    .info-cards {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    .info-card {
      background: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      padding: 30px 24px;
      width: 280px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .info-card h3 {
      color: #667eea;
      font-size: 1.3rem;
      margin-bottom: 12px;
    }
    .card-icon {
      width: 48px;
      height: 48px;
      margin-bottom: 10px;
      filter: drop-shadow(0 2px 6px rgba(0,0,0,0.10));
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    .hoteles-list {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    .hotel-card {
      background: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      padding: 30px 24px;
      width: 280px;
      margin-bottom: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hotel-card h3 {
      color: #764ba2;
      font-size: 1.3rem;
      margin-bottom: 12px;
    }
    .footer {
      background: #764ba2;
      color: white;
      text-align: center;
      padding: 18px 0;
      font-size: 1rem;
      margin-top: 0;
    }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .login-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      padding: 0;
      z-index: 1001;
      min-width: 350px;
      max-width: 95vw;
    }
    .close-modal {
      position: absolute;
      top: 10px;
      right: 20px;
      background: transparent;
      border: none;
      font-size: 2rem;
      color: #764ba2;
      cursor: pointer;
      z-index: 1002;
    }
    @media (max-width: 900px) {
      .info-cards, .hoteles-list {
        flex-direction: column;
        align-items: center;
      }
      .navbar {
        flex-direction: column;
        gap: 10px;
        padding: 18px 10px;
      }
      .hero {
        padding-top: 100px;
      }
    }
    body {
      margin: 0;
      font-family: 'Montserrat', Arial, sans-serif;
      background: #f5f5f5;
    }
    .navbar {
      width: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 40px;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .navbar-brand {
      font-size: 1.7rem;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .navbar-links {
      display: flex;
      gap: 30px;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .navbar-links li {
      display: flex;
      align-items: center;
    }
    .navbar-links a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      font-size: 1rem;
      transition: color 0.3s;
    }
    .navbar-links a:hover {
      color: #ffd700;
    }
    .login-nav-btn {
      background: white;
      color: #764ba2;
      border: none;
      border-radius: 5px;
      padding: 8px 22px;
      font-size: 1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s, color 0.3s;
    }
    .login-nav-btn:hover {
      background: #f5f5f5;
      color: #667eea;
    }
    .hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 60px 20px 40px 20px;
    }
    .hero h1 {
      font-size: 3rem;
      font-weight: bold;
      margin-bottom: 18px;
    }
    .hero p {
      font-size: 1.3rem;
      margin-bottom: 30px;
    }
    .hero-btn {
      background: white;
      color: #764ba2;
      border: none;
      border-radius: 5px;
      padding: 14px 38px;
      font-size: 1.1rem;
      font-weight: bold;
      cursor: pointer;
      transition: background 0.3s, color 0.3s;
    }
    .hero-btn:hover {
      background: #f5f5f5;
      color: #667eea;
    }
    .info-section {
      background: #fff;
      padding: 60px 20px;
      text-align: center;
    }
    .info-section h2 {
      font-size: 2.2rem;
      color: #764ba2;
      margin-bottom: 30px;
    }
    .info-cards {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    .info-card {
      background: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      padding: 30px 24px;
      width: 280px;
      margin-bottom: 20px;
    }
    .info-card h3 {
      color: #667eea;
      font-size: 1.3rem;
      margin-bottom: 12px;
    }
    .hoteles-list {
      display: flex;
      justify-content: center;
      gap: 30px;
      flex-wrap: wrap;
    }
    .hotel-card {
      background: #f8f9fa;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.08);
      padding: 30px 24px;
      width: 280px;
      margin-bottom: 20px;
    }
    .hotel-card h3 {
      color: #764ba2;
      font-size: 1.3rem;
      margin-bottom: 12px;
    }
    .footer {
      background: #764ba2;
      color: white;
      text-align: center;
      padding: 18px 0;
      font-size: 1rem;
      margin-top: 0;
    }
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      z-index: 1000;
    }
    .login-modal {
      position: fixed;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 10px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      padding: 0;
      z-index: 1001;
      min-width: 350px;
      max-width: 95vw;
    }
    .close-modal {
      position: absolute;
      top: 10px;
      right: 20px;
      background: transparent;
      border: none;
      font-size: 2rem;
      color: #764ba2;
      cursor: pointer;
      z-index: 1002;
    }
    @media (max-width: 900px) {
      .info-cards, .hoteles-list {
        flex-direction: column;
        align-items: center;
      }
      .navbar {
        flex-direction: column;
        gap: 10px;
        padding: 18px 10px;
      }
    }
  `]
})
export class HomeComponent {
  showLogin = false;
  closeModal() {
    this.showLogin = false;
  }
}
