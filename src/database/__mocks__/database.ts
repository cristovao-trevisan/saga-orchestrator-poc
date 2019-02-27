export default {
  save: jest.fn(),
  load: jest.fn(async () => ({
    failure: false,
    completed: [],
    missing: [],
    rollback: [],
    payload: {},
  })),
  list: jest.fn(async () => []),
  remove: jest.fn(),
};
