import { SagaExecution, SagaExecutionResult } from '../types';
import request from '../../service/request';

type SagaExecutor = (current: SagaExecution) => Promise<SagaExecutionResult>;

const execute: SagaExecutor = async (current) => {
  const toExecuteStep = current.missing[0];
  try {
    const response = await request(
      toExecuteStep.baseUrl,
      toExecuteStep.commit,
      current.payload,
    );
    if (response.statusCode !== 200) throw new Error()

    const nextStep: SagaExecution = {
      ...current,
      completed: [...current.completed, toExecuteStep],
      missing: current.missing.slice(1),
      payload: {
        ...current.payload,
        [toExecuteStep.name]: JSON.parse(response.body),
      },
    };

    if (nextStep.missing.length === 0) return { finished: true };

    return { nextStep, finished: false };
  } catch (err) {
    console.error(current.id, err);
    const nextStep: SagaExecution = {
      ...current,
      rollback: [...current.completed].reverse(),
      failure: true,
    };

    if (nextStep.rollback.length === 0) return { finished: true };

    return { nextStep, finished: false };
  }
};

const executeFailure: SagaExecutor = async (current) => {
  const toExecuteStep = current.rollback[0];

  try {
    const response = await request(
      toExecuteStep.baseUrl,
      toExecuteStep.rollback,
      current.payload,
    );

    const nextStep: SagaExecution = {
      ...current,
      rollback: current.rollback.slice(1),
      payload: {
        ...current.payload,
        [toExecuteStep.name]: JSON.parse(response.body),
      },
    };

    if (nextStep.rollback.length === 0) return { finished: true };

    return { nextStep, finished: false };
  } catch (err) {
    console.error(current.id, err);
    return { finished: false, nextStep: current };
  }
};

const run: SagaExecutor = async (current) => {
  if (current.failure) return executeFailure(current);
  return execute(current);
};

export default run;
