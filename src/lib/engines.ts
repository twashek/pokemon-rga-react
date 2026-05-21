/* lib/engines.ts */
import type {
  GeneratedAnswer,
  GeneratedAnswerProps,
  SearchEngine,
} from '@coveo/headless';
import { getAnswerGenerator } from './getAnswerGenerator';
import { getSearchEngine } from './getSearchEngine';

// Ensure single instance across the app
export const headlessEngine: SearchEngine = getSearchEngine();

export const answerGenerator = (
  props?: GeneratedAnswerProps
): GeneratedAnswer => {
  return getAnswerGenerator(headlessEngine, props);
};
