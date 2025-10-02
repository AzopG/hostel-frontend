import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class ReportesBarChartComponent implements AfterViewInit {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() title: string = '';
  @ViewChild('barChart', { static: false }) barChartRef!: ElementRef<HTMLCanvasElement>;

  ngAfterViewInit(): void {
    if (!(window as any).Chart) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
      script.onload = () => this.renderChart();
      document.body.appendChild(script);
    } else {
      this.renderChart();
    }
  }

  renderChart(): void {
    if (!this.barChartRef || !(window as any).Chart) return;
    const ctx = this.barChartRef.nativeElement.getContext('2d');
    if (!ctx) return;
    new (window as any).Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labels,
        datasets: [{
          label: this.title,
          data: this.data,
          backgroundColor: '#8B1538',
          borderRadius: 8,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: this.title }
        },
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, grid: { color: '#eee' } }
        }
      }
    });
  }
}
