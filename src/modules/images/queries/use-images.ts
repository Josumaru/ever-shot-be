"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { imageKeys, type ImageFilters } from "./query-keys";
import type { PaginationMeta } from "@/shared/types/pagination";
import { buildUrlSearchParams } from "@/shared/utils/pagination";

type Image = {
  id: string;
  title: string;
  slug: string;
  originalName: string;
  mimeType: string;
  size: number;
  views: number;
  width: number | null;
  height: number | null;
  createdAt: string;
  url: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
};

export function useImages(filters?: ImageFilters) {
  return useQuery({
    queryKey: imageKeys.list(filters),
    queryFn: async () => {
      const params = buildUrlSearchParams({
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
        search: filters?.search,
      });
      const { data } = await api.get<ApiResponse<Image[]>>(
        `/images?${params.toString()}`,
      );
      return data;
    },
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<null>>(`/images/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}

export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post<ApiResponse<Image>>("/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: imageKeys.all });
    },
  });
}
