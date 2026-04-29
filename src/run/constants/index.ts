export const RUN_COLLECTION_NAME = 'runs';

export enum RUN_STATUS {
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
  RUNNING = 'running',
}

export enum RUN_STEP_CODE {
  COMPONENT_GENERATION = 'component_generation',
  COMPONENT_INTERFACES = 'component_interfaces',
  E2E_TESTS = 'e2e_tests',
  GAP_ANALYSIS = 'gap_analysis',
  PARSING = 'parsing',
  RESOLVING_GAPS = 'resolving_gaps',
  UNIT_TESTS = 'unit_tests',
  USER_FLOWS = 'user_flows',
  VALIDATION = 'validation',
}

export enum RUN_STEP_STATUS {
  COMPLETED = 'completed',
  FAILED = 'failed',
  PENDING = 'pending',
  RUNNING = 'running',
  SKIPPED = 'skipped',
}

export enum RUN_FINAL_COMPONENT_TYPE {
  CARD = 'card',
  FORM = 'form',
  MODAL = 'modal',
  PAGE = 'page',
  TABLE = 'table',
}

export enum RUN_USER_FLOW_KIND {
  EXPLORATORY_HAPPY = 'exploratory_happy',
  SHORTEST_HAPPY = 'shortest_happy',
  UNHAPPY_INVALID_INPUT = 'unhappy_invalid_input',
}

export enum RUN_TEST_TYPE {
  E2E = 'e2e',
  UNIT = 'unit',
}
