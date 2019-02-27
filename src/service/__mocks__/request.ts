
export const mockValue = { body: '{ "mock": true }', statusCode: 200 };
export default jest.fn(async () => mockValue);
