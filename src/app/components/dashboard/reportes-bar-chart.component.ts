import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';

@Component({
  selector: 'app-reportes-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="width:100%;height:350px;display:flex;align-items:center;justify-content:center;">
      <canvas #barChart></canvas>
    </div>
  `
})
export class ReportesBarChartComponent implements AfterViewInit, OnChanges {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() title: string = '';
  @ViewChild('barChart', { static: false }) barChartRef!: ElementRef<HTMLCanvasElement>;
  
  private chart: any = null;

  ngAfterViewInit(): void {
    // console.log('🎨 ReportesBarChartComponent ngAfterViewInit');
    // console.log('🎨 Initial labels:', this.labels);
    // console.log('🎨 Initial data:', this.data);
    this.initializeChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // console.log('🔄 ReportesBarChartComponent ngOnChanges:', changes);
    if (changes['labels'] || changes['data']) {
      // console.log('🔄 Labels o Data cambiaron, actualizando chart...');
      // console.log('🔄 New labels:', this.labels);
      // console.log('🔄 New data:', this.data);
      this.updateChart();
    }
  }

  private initializeChart(): void {
    if (!(window as any).Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.renderChart();
      document.body.appendChild(script);
    } else {
      this.renderChart();
    }
  }

  private updateChart(): void {
    if (this.chart && this.labels.length > 0 && this.data.length > 0) {
      // console.log('📊 Actualizando chart existente...');
      this.chart.data.labels = this.labels;
      this.chart.data.datasets[0].data = this.data;
      
      // Actualizar colores
      const chartColors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
        '#F1948A', '#AED6F1', '#D7BDE2', '#A9DFBF'
      ];
      
      const backgroundColors = this.data.map((_, index) => 
        chartColors[index % chartColors.length]
      );
      
      this.chart.data.datasets[0].backgroundColor = backgroundColors;
      this.chart.data.datasets[0].borderColor = backgroundColors.map(color => color + '80');
      this.chart.update();
      // console.log('✅ Chart actualizado!');
    } else if (this.barChartRef && this.labels.length > 0 && this.data.length > 0) {
      // console.log('📊 Creando nuevo chart...');
      this.renderChart();
    }
  }

  renderChart(): void {
    // console.log('🎨 renderChart llamado');
    // console.log('🎨 this.labels:', this.labels);
    // console.log('🎨 this.data:', this.data);
    
    if (!this.barChartRef || !(window as any).Chart) {
      // console.log('❌ Chart.js no está disponible o ref no existe');
      return;
    }
    
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) {
      // console.log('❌ No se pudo obtener contexto del canvas');
      return;
    }

    // Destruir chart anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    // Colores vibrantes para las barras (sin blanco)
    const chartColors = [
      '#FF6B6B', // Rojo coral
      '#4ECDC4', // Turquesa
      '#45B7D1', // Azul cielo
      '#96CEB4', // Verde menta
      '#FFEAA7', // Amarillo suave
      '#DDA0DD', // Violeta
      '#98D8C8', // Verde agua
      '#F7DC6F', // Dorado claro
      '#BB8FCE', // Morado claro
      '#85C1E9', // Azul claro
      '#F8C471', // Naranja claro
      '#82E0AA', // Verde claro
      '#F1948A', // Rosa coral
      '#AED6F1', // Azul pastel
      '#D7BDE2', // Lila
      '#A9DFBF'  // Verde pastel
    ];

    // Asignar colores a cada barra
    const backgroundColors = this.data.map((_, index) => 
      chartColors[index % chartColors.length]
    );

    // console.log('🎨 Creando nuevo chart con Chart.js...');
    
    this.chart = new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.title,
          data: this.data,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color + '80'), // Borde semi-transparente
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { 
            display: true, 
            text: this.title,
            font: {
              family: 'Playfair Display',
              size: 16,
              weight: 'bold'
            },
            color: '#1C2526'
          }
        },
        scales: {
          x: { 
            grid: { display: false },
            ticks: {
              font: {
                family: 'Crimson Text',
                size: 12
              },
              color: '#4A1B2F'
            }
          },
          y: { 
            beginAtZero: true, 
            grid: { color: '#E5E5E5' },
            ticks: {
              font: {
                family: 'Crimson Text',
                size: 12
              },
              color: '#4A1B2F'
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
    
    // console.log('✅ Chart creado exitosamente!');
    // console.log('✅ Chart data:', this.chart.data);
  }
}
