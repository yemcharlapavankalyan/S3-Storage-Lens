import { CandidateStatus, OptimizationCandidate } from '../types';
import { apiClient } from './api';

export async function getOptimizationCandidates(): Promise<OptimizationCandidate[]> {
  return apiClient<OptimizationCandidate[]>('/optimization/candidates');
}

export async function getCandidateById(id: string): Promise<OptimizationCandidate | undefined> {
  return apiClient<OptimizationCandidate>(`/optimization/candidates/${id}`);
}

export async function updateCandidateStatus(
  id: string,
  status: CandidateStatus
): Promise<{ success: boolean; candidate: OptimizationCandidate }> {
  return apiClient<{ success: boolean; candidate: OptimizationCandidate }>(
    `/optimization/candidates/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }
  );
}
