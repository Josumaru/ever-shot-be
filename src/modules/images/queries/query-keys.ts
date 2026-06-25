export type ImageFilters = {
  page?: number;
  limit?: number;
  search?: string;
};

export const imageKeys = {
  all: ["images"] as const,
  list: (filters?: ImageFilters) => ["images", "list", filters ?? {}] as const,
};
