type BookRow = {
  title: unknown;
  author: unknown;
  isbn: unknown;
  quantity: unknown;
  price: unknown;
};

export default class BookSearchApiClient {
  private format: "json" | "xml";

  constructor(format: "json" | "xml" = "json") {
    this.format = format;
  }

  async getBooksByAuthor(authorName: string, limit: number) {
    let result: BookRow[] = [];
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=+inauthor:${authorName}&fields=items(volumeInfo/title,volumeInfo/authors, volumeInfo/publisher, volumeInfo/industryIdentifiers, saleInfo/listPrice)&maxResults=${limit}`,
    );

    if (response.status === 200) {
      const books = await response.json();
      if (this.format === "json") {
        result = books.items.map((item: any) => ({
          title: item.volumeInfo.title,
          author: Array.isArray(item.volumeInfo.authors)
            ? item.volumeInfo.authors.join(", ")
            : item.volumeInfo.authors,
          isbn: Array.isArray(item.volumeInfo.industryIdentifiers)
            ? item.volumeInfo.industryIdentifiers[0].identifier
            : item.volumeInfo.industryIdentifiers,
          quantity: item?.saleInfo?.listPrice?.amount,
          price: item?.saleInfo?.listPrice?.currencyCode,
        }));
      } else if (this.format == "xml") {
        // TODO: Implement XML parsing
      }

      return result;
    } else {
      throw new Error(`Request failed.  Returned status of ${response.status}`);
    }
  }
}
