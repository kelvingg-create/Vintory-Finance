import { useQuery, useMutation } from '@tanstack/react-query';
import { reportsService } from '../services/reports.service';
import type { DateRange } from '../types/api.types';

// Query keys for cache management
export const reportKeys = {
  all: ['reports'] as const,
  summary: (dateRange?: DateRange) => [...reportKeys.all, 'summary', dateRange] as const,
  cashFlow: (dateRange?: DateRange) => [...reportKeys.all, 'cashFlow', dateRange] as const,
  comparison: (startDate: string, endDate: string) =>
    [...reportKeys.all, 'comparison', startDate, endDate] as const,
};

/**
 * Query hook for fetching KPI summary
 */
export function useSummary(dateRange: DateRange = {}) {
  return useQuery({
    queryKey: reportKeys.summary(dateRange),
    queryFn: () => reportsService.getSummary(dateRange),
    select: (data) => data.data,
  });
}

/**
 * Query hook for fetching cash flow data
 */
export function useCashFlow(dateRange: DateRange = {}) {
  return useQuery({
    queryKey: reportKeys.cashFlow(dateRange),
    queryFn: () => reportsService.getCashFlow(dateRange),
    select: (data) => data.data,
  });
}

/**
 * Query hook for fetching comparison data
 */
export function useComparison(startDate: string, endDate: string, enabled: boolean = true) {
  return useQuery({
    queryKey: reportKeys.comparison(startDate, endDate),
    queryFn: () => reportsService.getComparison(startDate, endDate),
    select: (data) => data.data,
    enabled: enabled && !!startDate && !!endDate,
  });
}

/**
 * Mutation hook for exporting CSV
 */
export function useExportCsv() {
  return useMutation({
    mutationFn: (dateRange: DateRange = {}) => reportsService.downloadCsv(dateRange),
  });
}
