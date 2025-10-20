import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-export.component.html',
  styleUrls: ['./report-export.component.css']
})
export class ReportExportComponent {
  @Input() data: any;
  @Input() reportType: string = 'balance';

  exportAsJson(): void {
    const dataStr = JSON.stringify(this.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    this.downloadFile(dataBlob, `${this.reportType}_report.json`);
  }

  exportAsCsv(): void {
    // Simplified CSV export - would need more sophisticated logic for nested data
    const csv = this.convertToCSV(this.data);
    const dataBlob = new Blob([csv], { type: 'text/csv' });
    this.downloadFile(dataBlob, `${this.reportType}_report.csv`);
  }

  private convertToCSV(data: any): string {
    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const headerRow = headers.join(',');
      
      const rows = data.map(item => 
        headers.map(header => {
          const value = item[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      );
      
      return [headerRow, ...rows].join('\n');
    }
    return JSON.stringify(data);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}

