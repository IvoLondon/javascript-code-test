import { getProvider } from "./providers";

const client = getProvider("googleBooks");
const booksByShakespeare = await client.getBooksByAuthor("Shakespeare", 10);
console.log(booksByShakespeare);
