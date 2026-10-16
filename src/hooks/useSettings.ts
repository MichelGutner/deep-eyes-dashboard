import { useContext } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SettingsContext } from '../contexts/SettingsContext';
import { fetchSettings, updateSettings } from '../services/settingsService';

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export function useOrgSettings() {
  return useQuery({
    queryKey: ['org-settings'],
    queryFn: fetchSettings,
    staleTime: 60_000,
  });
}

export function useUpdateOrgSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['org-settings'] }),
  });
}
