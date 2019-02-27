import { SagaStep } from '../types';

type DefaultSagaFactory = (name: string, baseUrl: string) => SagaStep;
const defaultSaga: DefaultSagaFactory = (name, baseUrl) => ({
  name,
  baseUrl,

  commit: {
    path: '/',
    method: 'POST',
  },
  rollback: {
    path: '/',
    method: 'DELETE',
  },
});

export default defaultSaga;
