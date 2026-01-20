// Only allow positive integers, return fallback if not a positive integer
export const parsePositiveInt = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
        return fallback;
    }
    return parsed;
};

// Paginate items
export const paginate = (items, page, pageSize) => {
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
            totalPages
        }
    };
};
