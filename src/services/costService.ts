import { CostAnalysis } from '../types';
import { apiClient } from './api';

export async function getCostAnalysis(): Promise<CostAnalysis> {
  return apiClient<CostAnalysis>('/cost/analysis');
}
