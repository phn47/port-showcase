import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blog } from '@/services/api/supabase';
import type { BlogFilters, CreateBlogPostRequest, UpdateBlogPostRequest } from '@/services/api/types';

export const useBlogPosts = (filters?: BlogFilters) => {
    return useQuery({
        queryKey: ['blog', filters],
        queryFn: () => blog.list(filters || {}),
        staleTime: 5 * 60 * 1000,
    });
};

export const useBlogPost = (slug: string) => {
    return useQuery({
        queryKey: ['blog', slug],
        queryFn: () => blog.get(slug),
        enabled: !!slug,
    });
};

export const useBlogPostById = (id: string) => {
    return useQuery({
        queryKey: ['blog', 'id', id],
        queryFn: () => blog.getById(id),
        enabled: !!id,
    });
};

export const useCreateBlogPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateBlogPostRequest) => blog.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog'] });
        },
    });
};

export const useUpdateBlogPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogPostRequest }) =>
            blog.update(id, payload),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['blog'] });
            queryClient.invalidateQueries({ queryKey: ['blog', 'id', vars.id] });
            // Invalidate slug query too if needed, but tricky since we don't know slug in success context accurately without reading result.
            // Usually invalidate list is enough.
        },
    });
};

export const useDeleteBlogPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => blog.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blog'] });
        },
    });
};
