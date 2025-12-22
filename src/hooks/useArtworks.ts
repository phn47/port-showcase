import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { artworks } from '@/services/api/supabase';
import type { ArtworkFilters, CreateArtworkRequest, UpdateArtworkRequest, ArtworkListResponse } from '@/services/api/types';

export const useArtworks = (filters?: ArtworkFilters) => {
  return useQuery<ArtworkListResponse>({
    queryKey: ['artworks', filters],
    queryFn: () => artworks.list(filters || {}),
    staleTime: 5 * 60 * 1000,
  });
};

export const useArtwork = (id: string) => {
  return useQuery({
    queryKey: ['artwork', id],
    queryFn: () => artworks.get(id),
    enabled: !!id,
  });
};

export const useCreateArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateArtworkRequest) => artworks.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
};

export const useUpdateArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateArtworkRequest }) =>
      artworks.update(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
      queryClient.invalidateQueries({ queryKey: ['artwork', variables.id] });
    },
  });
};

export const useDeleteArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => artworks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
};

export const usePublishArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => artworks.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
};

export const useUnpublishArtwork = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => artworks.unpublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artworks'] });
    },
  });
};
