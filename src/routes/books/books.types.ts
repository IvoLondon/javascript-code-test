interface BooksByAuthorQuery {
  author?: string;
  limit?: string;
  providerName?: string;
  format?: string;
}

interface BooksByPublisherQuery {
  publisher?: string;
  limit?: string;
  providerName?: string;
  format?: string;
}

export type { BooksByAuthorQuery, BooksByPublisherQuery };
