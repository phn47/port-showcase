import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { timeline } from '@/services/api/supabase';
import type { TimelineFilters, CreateTimelineEntryRequest, UpdateTimelineEntryRequest } from '@/services/api/types';

export const useTimelineEntries = (filters?: TimelineFilters) => {
  return useQuery({
    queryKey: ['timeline', filters],
    queryFn: () => timeline.list(filters || {}),
    staleTime: 5 * 60 * 1000,
  });
};

export const useTimelineEntry = (id: string) => {
  return useQuery({
    queryKey: ['timeline', id],
    queryFn: () => timeline.get(id),
    enabled: !!id,
  });
};

export const useCreateTimelineEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTimelineEntryRequest) => timeline.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const useUpdateTimelineEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTimelineEntryRequest }) =>
      timeline.update(id, payload),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['timeline', vars.id] });
    },
  });
};

export const useDeleteTimelineEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeline.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const usePublishTimelineEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeline.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const useUnpublishTimelineEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => timeline.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};
