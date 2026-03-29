export interface Book {
  title: string;
  author: string;
  isbn: string;
  quantity: "Available" | "Out of stock";
  price: number;
}

export interface BookProvider {
  getBooksByAuthor(authorName: string, limit: number): Promise<Book[]>;
  getBooksByPublisher(authorName: string, limit: number): Promise<Book[]>;
  formatResponse(response: Response): Promise<Book[]>;
}
