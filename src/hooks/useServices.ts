import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { services } from '@/services/api/supabase';
import type { ServiceFilters, CreateServiceRequest, UpdateServiceRequest } from '@/services/api/types';

export const useServices = (filters?: ServiceFilters) => {
    return useQuery({
        queryKey: ['services', filters],
        queryFn: () => services.list(filters || {}),
        staleTime: 5 * 60 * 1000,
    });
};

export const useService = (id: string) => {
    return useQuery({
        queryKey: ['services', id],
        queryFn: () => services.get(id),
        enabled: !!id,
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateServiceRequest) => services.create(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: UpdateServiceRequest }) =>
            services.update(id, payload),
        onSuccess: (_, vars) => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
            queryClient.invalidateQueries({ queryKey: ['services', vars.id] });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => services.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const usePublishService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => services.publish(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUnpublishService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => services.unpublish(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};
