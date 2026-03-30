import { describe, expect, it } from "vitest";
import GoogleBooksAPI from "./GoogleBooksAPI";
import { getProvider } from "./index";

describe("getProvider", () => {
  it('returns a GoogleBooksAPI instance for "googleBooks"', () => {
    const provider = getProvider("googleBooks");
    expect(provider).toBeInstanceOf(GoogleBooksAPI);
  });

  it("forwards the format parameter to the provider", () => {
    const provider = getProvider("googleBooks", "xml");
    expect(provider).toBeInstanceOf(GoogleBooksAPI);
  });

  it("throws when the provider name is unknown", () => {
    expect(() => getProvider("unknown")).toThrow("Provider unknown not found");
  });
});
