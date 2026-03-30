interface BooksByAuthorQuery {
  author?: string;
  limit?: string;
  page?: string;
  providerName?: string;
  format?: string;
}

interface BooksByPublisherQuery {
  publisher?: string;
  limit?: string;
  page?: string;
  providerName?: string;
  format?: string;
}

export type { BooksByAuthorQuery, BooksByPublisherQuery };
