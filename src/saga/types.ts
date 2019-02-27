export interface SagaRequest {
  path: string;
  method: string;
}

export interface SagaStep {
  name: string;
  baseUrl: string;
  commit: SagaRequest;
  rollback: SagaRequest;
}

export interface SagaExecution {
  id: string;
  failure: boolean;
  completed: SagaStep[];
  missing: SagaStep[];
  rollback: SagaStep[];
  payload: object;
}

export interface SagaExecutionResult {
  finished: boolean;
  nextStep?: SagaExecution;
}

export type SagaBuilder = (initialPayload: object, id?: string) => SagaExecution;
