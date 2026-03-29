import BookSearchApiClient from "./BookSearchApiClient";

const client = new BookSearchApiClient();
const booksByShakespeare = await client.getBooksByAuthor("Shakespeare", 10);
console.log(booksByShakespeare);
