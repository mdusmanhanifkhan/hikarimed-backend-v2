export const getPagination = (query) => {
  const page = query.page && Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = query.limit && Number(query.limit) > 0 ? Number(query.limit) : 20;

  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
  };
};

export const buildPaginationResponse = (total, page, limit, dataLength) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
};
