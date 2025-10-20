import { Injectable } from '@nestjs/common';
import { UserBalance, SubscriptionBalance } from './balance.service';

export type ExportFormat = 'json' | 'csv' | 'pdf';

@Injectable()
export class ReportExportService {
  /**
   * Export user balance report to specified format
   */
  async exportUserBalance(
    balance: UserBalance,
    format: ExportFormat = 'json',
  ): Promise<string | Buffer> {
    switch (format) {
      case 'json':
        return this.exportToJson(balance);
      case 'csv':
        return this.exportUserBalanceToCSV(balance);
      case 'pdf':
        return this.exportToPDF(balance);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export subscription balance report to specified format
   */
  async exportSubscriptionBalance(
    balance: SubscriptionBalance,
    format: ExportFormat = 'json',
  ): Promise<string | Buffer> {
    switch (format) {
      case 'json':
        return this.exportToJson(balance);
      case 'csv':
        return this.exportSubscriptionBalanceToCSV(balance);
      case 'pdf':
        return this.exportToPDF(balance);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export all balances to specified format
   */
  async exportAllBalances(
    balances: UserBalance[],
    format: ExportFormat = 'json',
  ): Promise<string | Buffer> {
    switch (format) {
      case 'json':
        return this.exportToJson(balances);
      case 'csv':
        return this.exportAllBalancesToCSV(balances);
      case 'pdf':
        return this.exportToPDF(balances);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Export data to JSON format
   */
  private exportToJson(data: any): string {
    return JSON.stringify(data, null, 2);
  }

  /**
   * Export user balance to CSV format
   */
  private exportUserBalanceToCSV(balance: UserBalance): string {
    const headers = [
      'User ID',
      'User Name',
      'User Email',
      'Total Charges',
      'Total Verified Payments',
      'Total Pending Payments',
      'Balance Due',
      'Balance with Pending',
    ];

    const rows = [
      [
        balance.user_id,
        balance.user_name,
        balance.user_email,
        balance.total_charges.toString(),
        balance.total_verified_payments.toString(),
        balance.total_pending_payments.toString(),
        balance.balance_due.toString(),
        balance.balance_with_pending.toString(),
      ],
    ];

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Export subscription balance to CSV format
   */
  private exportSubscriptionBalanceToCSV(balance: SubscriptionBalance): string {
    const headers = [
      'User ID',
      'User Name',
      'User Email',
      'Total Charges',
      'Total Verified Payments',
      'Total Pending Payments',
      'Balance Due',
      'Balance with Pending',
    ];

    const rows = balance.user_balances.map(userBalance => [
      userBalance.user_id,
      userBalance.user_name,
      userBalance.user_email,
      userBalance.total_charges.toString(),
      userBalance.total_verified_payments.toString(),
      userBalance.total_pending_payments.toString(),
      userBalance.balance_due.toString(),
      userBalance.balance_with_pending.toString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Export all balances to CSV format
   */
  private exportAllBalancesToCSV(balances: UserBalance[]): string {
    const headers = [
      'User ID',
      'User Name',
      'User Email',
      'Total Charges',
      'Total Verified Payments',
      'Total Pending Payments',
      'Balance Due',
      'Balance with Pending',
    ];

    const rows = balances.map(balance => [
      balance.user_id,
      balance.user_name,
      balance.user_email,
      balance.total_charges.toString(),
      balance.total_verified_payments.toString(),
      balance.total_pending_payments.toString(),
      balance.balance_due.toString(),
      balance.balance_with_pending.toString(),
    ]);

    return this.arrayToCSV([headers, ...rows]);
  }

  /**
   * Convert 2D array to CSV string
   */
  private arrayToCSV(data: string[][]): string {
    return data
      .map(row =>
        row
          .map(cell => {
            // Escape quotes and wrap in quotes if contains comma or quote
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(','),
      )
      .join('\n');
  }

  /**
   * Export data to PDF format
   * Note: This is a placeholder - PDF generation would require a library like pdfkit or puppeteer
   */
  private exportToPDF(data: any): Buffer {
    // TODO: Implement PDF export using a PDF generation library
    throw new Error('PDF export not yet implemented');
  }
}

