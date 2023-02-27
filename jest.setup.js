jest.mock("nanoid", () => {
  return {
    nanoid: jest.fn(() => "NANO_ID"),
  };
});
