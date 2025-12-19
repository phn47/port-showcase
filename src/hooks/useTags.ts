import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tags } from '@/services/api/supabase';
import type { Tag } from '@/services/api/types';

export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => tags.list(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { name: string; slug: string; color?: string }) =>
      tags.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Tag> }) =>
      tags.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tags.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });
};
