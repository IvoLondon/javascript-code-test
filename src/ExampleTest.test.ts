import { describe, test, expect } from "vitest";

import { helloWorld } from "./index";

describe("ExampleTest", () => {
  test("should return Hello World", () => {
    expect(helloWorld()).toBe("Hello World");
  });
});
