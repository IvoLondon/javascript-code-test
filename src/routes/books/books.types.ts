interface BooksByAuthorQuery {
  author?: string;
  limit?: string;
  providerName?: string;
}

interface BooksByPublisherQuery {
  publisher?: string;
  limit?: string;
  providerName?: string;
}

export type { BooksByAuthorQuery, BooksByPublisherQuery };
