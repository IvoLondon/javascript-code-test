import GoogleBooksAPI from "./GoogleBooksAPI";
import config from "../config";
import type { ResponseFormat } from "./providers.types";

export const getProvider = (
  providerName?: string,
  format?: ResponseFormat,
) => {
  const provider = providerName ?? config.defaultProvider;

  switch (provider) {
    case "googleBooks":
      return new GoogleBooksAPI(format);
    default:
      throw new Error(`Provider ${provider} not found`);
  }
};
