/**
 * Helper to safely parse and sanitize pagination parameters for Prisma queries.
 * Converts string-based query parameters from Express to integers.
 */
export function parsePagination(query?: { page?: any; quantity?: any }) {
  const pageNum = query?.page !== undefined && query?.page !== null && query?.page !== '' ? Number(query.page) : undefined;
  const qtyNum = query?.quantity !== undefined && query?.quantity !== null && query?.quantity !== '' ? Number(query.quantity) : undefined;

  const take: number | undefined = qtyNum && !isNaN(qtyNum) && qtyNum > 0 ? Math.floor(qtyNum) : undefined;
  const skip: number | undefined = pageNum && qtyNum && !isNaN(pageNum) && !isNaN(qtyNum) && pageNum > 0 && qtyNum > 0
    ? Math.floor((pageNum - 1) * qtyNum)
    : undefined;

  return {
    take,
    skip,
    page: pageNum && !isNaN(pageNum) ? pageNum : undefined,
    quantity: qtyNum && !isNaN(qtyNum) ? qtyNum : undefined,
  };
}

