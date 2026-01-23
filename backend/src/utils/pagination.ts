// Only allow positive integers, return fallback if not a positive integer
export const parsePositiveInt = (
  value: string | number | undefined | any,
  fallback: number,
): number => {
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
};

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface PaginationResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// Paginate items
export const paginate = <T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginationResult<T> => {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: items.slice(start, end),
    meta: {
      page: currentPage,
      pageSize,
      total,
      totalPages,
    },
  };
};
