export interface CreateMovieRequest {
  code: string;
  title: string;
  magnet_link?: string;
}

export interface UpdateMovieRequest {
  title?: string;
  magnet_link?: string;
}

export interface MovieResponse {
  code: string;
  title: string;
  magnet_link: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface SearchQuery {
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
