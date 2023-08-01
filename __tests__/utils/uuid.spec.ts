import { generateUUID, generateNanoId } from "../../src/utils/uuid";

describe("generateUUID", () => {
  it("should actually generate a UUID", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    );
  });
});

describe("generateNanoId", () => {
  it("should actually generate a nanoid", () => {
    const nanoidValue = generateNanoId();
    expect(nanoidValue).toMatch(/^[0-9a-zA-Z_-]{21}$/);
  });
});
