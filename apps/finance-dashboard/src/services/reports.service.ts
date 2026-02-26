import { api } from '../lib/api';
import type {
  Summary,
  CashFlowData,
  ComparisonData,
  DateRange,
  ApiResponse,
} from '../types/api.types';

export const reportsService = {
  /**
   * Get KPI summary statistics
   */
  async getSummary(dateRange: DateRange = {}): Promise<ApiResponse<Summary>> {
    const params: Record<string, string | undefined> = {};
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;

    return api.get<ApiResponse<Summary>>('/api/reports/summary', params);
  },

  /**
   * Get cash flow data for charts
   */
  async getCashFlow(dateRange: DateRange = {}): Promise<ApiResponse<CashFlowData[]>> {
    const params: Record<string, string | undefined> = {};
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;

    return api.get<ApiResponse<CashFlowData[]>>('/api/reports/cash-flow', params);
  },

  /**
   * Get comparison with previous period
   */
  async getComparison(startDate: string, endDate: string): Promise<ApiResponse<ComparisonData>> {
    return api.get<ApiResponse<ComparisonData>>('/api/reports/comparison', {
      startDate,
      endDate,
    });
  },

  /**
   * Export transactions as CSV
   */
  async exportCsv(dateRange: DateRange = {}): Promise<string> {
    const params: Record<string, string | undefined> = {};
    if (dateRange.startDate) params.startDate = dateRange.startDate;
    if (dateRange.endDate) params.endDate = dateRange.endDate;

    return api.get<string>('/api/reports/export', params);
  },

  /**
   * Trigger CSV download in browser
   */
  async downloadCsv(dateRange: DateRange = {}): Promise<void> {
    const csv = await this.exportCsv(dateRange);
    
    // Create a blob and trigger download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
