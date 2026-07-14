export function resolveReplyCount({ replies = [], pagination, fallbackCount = 0 }) {
  if (pagination?.total != null) {
    return Number(pagination.total);
  }

  if (Array.isArray(replies) && replies.length > 0) {
    return replies.length;
  }

  return Number(fallbackCount || 0);
}

export function getThreadReplySnapshot({ thread, replies = [], pagination, fallbackCount = 0 }) {
  const detailCount = resolveReplyCount({
    replies,
    pagination,
    fallbackCount: thread?.reply_count ?? fallbackCount,
  });

  return {
    previewCount: Number(thread?.reply_count ?? fallbackCount ?? 0),
    detailCount,
    matches: Number(thread?.reply_count ?? fallbackCount ?? 0) === detailCount,
  };
}
