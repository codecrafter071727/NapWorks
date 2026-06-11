export interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    from: number;
    to: number;
  };
  totalCount: number;
}

export interface ProductQueryParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
}
