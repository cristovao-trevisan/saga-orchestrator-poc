import uuidV1 from 'uuid/v1'

import defaultSagaStep from './default-saga-step';
import { SagaBuilder } from '../types';
import baseUrls from '../../service/urls';

const buildSaga: SagaBuilder = (webhook, initialPayload, id) => ({
  webhook,
  id: id || uuidV1(),
  failure: false,
  completed: [],
  missing: [
    defaultSagaStep('hotel', baseUrls.hotel),
    defaultSagaStep('airplane', baseUrls.airplane),
    defaultSagaStep('payment', baseUrls.payment),
  ],
  rollback: [],
  payload: {
    initial: initialPayload,
  },
});

export default buildSaga;
