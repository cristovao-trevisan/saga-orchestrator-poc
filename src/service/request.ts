import got from 'got';
import { SagaRequest } from '../saga/types';

export default (
  baseUrl: string,
  req: SagaRequest,
  payload: object,
) => {
  console.log('request', { baseUrl, req, payload });
  return got(`${baseUrl}/${req.path}`, {
    method: req.method,
    body: JSON.stringify(payload),
  });
};
