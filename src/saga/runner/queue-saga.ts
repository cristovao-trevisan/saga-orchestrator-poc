import PQueue from 'p-queue';
import { SagaExecution } from '../types';
import db from '../../database/database';
import run from './run-saga';

const queue = new PQueue({ concurrency: 2 });

const runItem = async (saga: SagaExecution) => {
  const result = await run(saga);

  if (result.finished) {
    await db.remove(saga.id);
  } else {
    await db.save(saga.id, result.nextStep!);
    queue.add(() => runItem(result.nextStep!));
  }
};

export const enqueue = async (saga: SagaExecution) => {
  await db.save(saga.id, saga);
  queue.add(() => runItem(saga));
};

export const enqueueExisting = () => {
  db.list().then((sagaList) => {
    sagaList.forEach(async (sagaKey) => {
      const saga = await db.load(sagaKey) as SagaExecution;
      enqueue(saga);
    });
  });
};
