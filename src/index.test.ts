import request from 'supertest';
import app from './routes/app';
import db from './database/database';
import mockedRequest from './service/request';
import { mockValue } from './service/__mocks__/request';
import urls from './service/urls';

jest.mock('./service/request');
jest.mock('./database/database');

const save = db.save as jest.Mock;
const remove = db.remove as jest.Mock;
const req = mockedRequest as jest.Mock;

const params = {
  hotel: 1234,
  airplane: 4312,
  creditCard: 87654321,
};
const input = {
  ...params,
  webhook: 'localhost:6666',
};
const mockedReturn = { mock: true };

beforeEach(() => {
  save.mockClear();
  remove.mockClear();
  req.mockClear();
});

test('should run successful saga', () => request(app)
  .post('/book-travel')
  .send(input)
  .expect(200)
  .then((res) => {
    expect(res.text).toBe('booking');
    expect(save.mock.calls.length).toBe(3);
    expect(remove.mock.calls.length).toBe(1);
    expect(req.mock.calls.length).toBe(4);
    expect(req.mock.calls[0]).toEqual([
      urls.hotel,
      { method: 'POST', path: '/' },
      { initial: params },
    ]);
    expect(req.mock.calls[1]).toEqual([
      urls.airplane,
      { method: 'POST', path: '/' },
      { initial: params, hotel: mockedReturn },
    ]);
    expect(req.mock.calls[2]).toEqual([
      urls.payment,
      { method: 'POST', path: '/' },
      { initial: params, hotel: mockedReturn, airplane: mockedReturn },
    ]);
    expect(req.mock.calls[3]).toEqual([
      input.webhook,
      { method: 'POST', path: '/' },
      { initial: params, hotel: mockedReturn, airplane: mockedReturn, payment: mockedReturn },
    ]);
  }));

test('should run saga with error and rollback', async () => {
  req
    .mockResolvedValueOnce(mockValue)
    .mockResolvedValueOnce(mockValue)
    .mockRejectedValueOnce({});

  const res = await request(app)
    .post('/book-travel')
    .send(input)
    .expect(200);

  expect(res.text).toBe('booking');
  expect(save.mock.calls.length).toBe(5);
  expect(remove.mock.calls.length).toBe(1);
  expect(req.mock.calls.length).toBe(5);
  expect(req.mock.calls[0]).toEqual([
    urls.hotel,
    { method: 'POST', path: '/' },
    { initial: params },
  ]);
  expect(req.mock.calls[1]).toEqual([
    urls.airplane,
    { method: 'POST', path: '/' },
    { initial: params, hotel: mockedReturn },
  ]);
  expect(req.mock.calls[2]).toEqual([
    urls.payment,
    { method: 'POST', path: '/' },
    { initial: params, hotel: mockedReturn, airplane: mockedReturn },
  ]);
  expect(req.mock.calls[3]).toEqual([
    urls.airplane,
    { method: 'DELETE', path: '/' },
    { initial: params, hotel: mockedReturn, airplane: mockedReturn },
  ]);
  expect(req.mock.calls[4]).toEqual([
    urls.hotel,
    { method: 'DELETE', path: '/' },
    { initial: params, hotel: mockedReturn, airplane: mockedReturn },
  ]);
});

test('should retry rollback until it succeeds', async () => {
  req
    .mockResolvedValueOnce(mockValue)
    .mockRejectedValueOnce({})
    .mockRejectedValueOnce({})
    .mockRejectedValueOnce({});

  const res = await request(app)
    .post('/book-travel')
    .send(input)
    .expect(200);

  expect(res.text).toBe('booking');
  expect(save.mock.calls.length).toBe(5);
  expect(remove.mock.calls.length).toBe(1);
  expect(req.mock.calls.length).toBe(5);
  expect(req.mock.calls[0]).toEqual([
    urls.hotel,
    { method: 'POST', path: '/' },
    { initial: params },
  ]);
  expect(req.mock.calls[1]).toEqual([
    urls.airplane,
    { method: 'POST', path: '/' },
    { initial: params, hotel: mockedReturn },
  ]);
  [2, 3, 4].forEach((i) => {
    expect(req.mock.calls[i]).toEqual([
      urls.hotel,
      { method: 'DELETE', path: '/' },
      { initial: params, hotel: mockedReturn },
    ]);
  });
});
