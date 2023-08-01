import { Logger } from "../../src/logger";

describe("Logger", () => {
  it("should log the message in uppercase", () => {
    const message = "hello";

    // Spy on the console.log function
    const consoleSpy = jest.spyOn(console, "log");

    // Call the Logger.log method
    Logger.log(message);

    // Expect that the console.log function was called with the correct message in uppercase
    expect(consoleSpy).toHaveBeenCalledWith(
      `*********** LOG: ${message.toUpperCase()} ***********`
    );

    // Restore the original console.log function after the test
    consoleSpy.mockRestore();
  });

  it("should log the message in uppercase even if it contains uppercase characters", () => {
    const message = "HeLLo";

    // Spy on the console.log function
    const consoleSpy = jest.spyOn(console, "log");

    // Call the Logger.log method
    Logger.log(message);

    // Expect that the console.log function was called with the correct message in uppercase
    expect(consoleSpy).toHaveBeenCalledWith(
      `*********** LOG: ${message.toUpperCase()} ***********`
    );

    // Restore the original console.log function after the test
    consoleSpy.mockRestore();
  });
});
