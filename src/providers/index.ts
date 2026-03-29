import GoogleBooksAPI from "./GoogleBooksAPI";

export const getProvider = (providerName: string) => {
  const provider = providerName;

  switch (provider) {
    case "googleBooks":
      return new GoogleBooksAPI();
    default:
      throw new Error(`Provider ${provider} not found`);
  }
};
