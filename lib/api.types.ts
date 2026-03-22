export interface ApiSuccessResponse<T> {
  statusCode: number;
  message: string;
  timestamp: string;
  data: T;
}

export interface ApiPaginationMetadata {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiPaginatedData<T> {
  items: T[];
  metadata: ApiPaginationMetadata;
}

export interface ApiGenericResponse {
  success: boolean;
  message: string;
}
