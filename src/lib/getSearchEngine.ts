/* lib/getSearchEngine.ts */
import {
  buildSearchEngine,
  type SearchEngine,
  type SearchEngineConfiguration,
  type SearchEngineOptions,
} from '@coveo/headless';

function getEngineConfiguration(): SearchEngineConfiguration {
  return {
    accessToken: 'xx925f21cd-6559-4bcc-8d23-f21e4f1ff1e4',
    organizationId: 'psjlzopg4zxkq4jxmyvglhacadq',
    analytics: {
      analyticsMode: 'legacy'
    },
    search: {
      pipeline: 'rag-app',
      searchHub: 'default',
    },
  };
}

export const getSearchEngine = (): SearchEngine => {
  const searchEngineOptions: SearchEngineOptions = {
    configuration: getEngineConfiguration(),
  };

  return buildSearchEngine(searchEngineOptions);
};
