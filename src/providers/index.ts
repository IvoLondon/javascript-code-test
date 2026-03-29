import GoogleBooksAPI from "./GoogleBooksAPI";
import config from "../config";

export const getProvider = (providerName?: string) => {
  const provider = providerName ?? config.defaultProvider;

  switch (provider) {
    case "googleBooks":
      return new GoogleBooksAPI();
    default:
      throw new Error(`Provider ${provider} not found`);
  }
};
