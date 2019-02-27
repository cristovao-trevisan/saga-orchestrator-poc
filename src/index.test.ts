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

const param = {
  hotel: 1234,
  airplane: 4312,
  creditCard: 87654321,
};
const mockedReturn = { mock: true };

beforeEach(() => {
  save.mockClear();
  remove.mockClear();
  req.mockClear();
});

test('should run successful saga', () => request(app)
  .post('/book-travel')
  .send(param)
  .expect(200)
  .then((res) => {
    expect(res.text).toBe('booking');
    expect(save.mock.calls.length).toBe(3);
    expect(remove.mock.calls.length).toBe(1);
    expect(req.mock.calls.length).toBe(3);
    expect(req.mock.calls[0]).toEqual([
      urls.hotel,
      { method: 'POST', path: '/' },
      { initial: param },
    ]);
    expect(req.mock.calls[1]).toEqual([
      urls.airplane,
      { method: 'POST', path: '/' },
      { initial: param, hotel: mockedReturn },
    ]);
    expect(req.mock.calls[2]).toEqual([
      urls.payment,
      { method: 'POST', path: '/' },
      { initial: param, hotel: mockedReturn, airplane: mockedReturn },
    ]);
  }));

test('should run saga with error and rollback', () => {
  req
    .mockResolvedValueOnce(mockValue)
    .mockResolvedValueOnce(mockValue)
    .mockRejectedValueOnce({});

  return request(app)
    .post('/book-travel')
    .send(param)
    .expect(200)
    .then((res) => {
      expect(res.text).toBe('booking');
      expect(save.mock.calls.length).toBe(5);
      expect(remove.mock.calls.length).toBe(1);
      expect(req.mock.calls.length).toBe(5);
      expect(req.mock.calls[0]).toEqual([
        urls.hotel,
        { method: 'POST', path: '/' },
        { initial: param },
      ]);
      expect(req.mock.calls[1]).toEqual([
        urls.airplane,
        { method: 'POST', path: '/' },
        { initial: param, hotel: mockedReturn },
      ]);
      expect(req.mock.calls[2]).toEqual([
        urls.payment,
        { method: 'POST', path: '/' },
        { initial: param, hotel: mockedReturn, airplane: mockedReturn },
      ]);
      expect(req.mock.calls[3]).toEqual([
        urls.airplane,
        { method: 'DELETE', path: '/' },
        { initial: param, hotel: mockedReturn, airplane: mockedReturn },
      ]);
      expect(req.mock.calls[4]).toEqual([
        urls.hotel,
        { method: 'DELETE', path: '/' },
        { initial: param, hotel: mockedReturn, airplane: mockedReturn },
      ]);
    });
});
