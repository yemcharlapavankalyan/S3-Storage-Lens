import { LifecyclePolicy } from '../types';
import { apiClient } from './api';

export async function getLifecycleSummary() {
  return apiClient('/lifecycle/summary');
}

export async function getLifecyclePolicies(): Promise<LifecyclePolicy[]> {
  return apiClient<LifecyclePolicy[]>('/lifecycle/policies');
}

export async function createLifecyclePolicy(
  policyData: Omit<LifecyclePolicy, 'id' | 'lastUpdated' | 'createdDate' | 'objectsImpacted' | 'estimatedSavings' | 'stages'>
): Promise<LifecyclePolicy> {
  return apiClient<LifecyclePolicy>(
    '/lifecycle/policies',
    {
      method: 'POST',
      body: JSON.stringify(policyData),
    }
  );
}
