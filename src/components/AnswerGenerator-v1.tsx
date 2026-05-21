import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  type GeneratedAnswerState,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
  type QueryActionCreators,
  type SearchActionCreators,
  type SearchAnalyticsActionCreators,
} from '@coveo/headless';
import {answerGenerator, headlessEngine} from '../lib/engines.js';

export const AnswerGenerator = () => {
  const [rgaState, setRgaState] = useState<GeneratedAnswerState>();
  const inputRef = useRef<HTMLInputElement>(null);

 const {updateQuery, executeSearch, logSearchboxSubmit, rgaController} =
  useMemo(() => {
    const rgaController = answerGenerator();
    const {updateQuery} = loadQueryActions(headlessEngine);
    const {executeSearch} = loadSearchActions(headlessEngine);
    const {logSearchboxSubmit} = loadSearchAnalyticsActions(headlessEngine);
    return {
      rgaController,
      updateQuery,
      executeSearch,
      logSearchboxSubmit,
    };
  }, []); // Empty array is fine here because headlessEngine is a singleton constant


  const submitQuestion = useCallback(() => {
    const query = inputRef.current?.value || '';
    headlessEngine.dispatch(updateQuery({q: query}));
    headlessEngine.dispatch(executeSearch(logSearchboxSubmit()));
  }, [updateQuery, executeSearch, logSearchboxSubmit]);

/* components/AnswerGenerator.tsx */

  useEffect(() => {
    // Only subscribe once when the controller is ready
    const unsubscribe = rgaController.subscribe(() =>
      setRgaState(rgaController.state)
    );
    
    return () => {
      unsubscribe();
    };
  }, [rgaController]); // REMOVE setRgaState from here


  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Ask a question..."
          ref={inputRef}
          disabled={rgaState?.isLoading}
          style={{ padding: '8px', width: '300px' }}
          onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
        />
        <button 
          type="button" 
          onClick={submitQuestion} 
          style={{ padding: '8px 16px', marginLeft: '8px' }}
        >
          Submit
        </button>
      </div>

      {rgaState?.isLoading && <div>Thinking...</div>}

      {rgaState?.answer && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f9f9f9', 
          borderRadius: '8px',
          border: '1px solid #ddd' 
        }}>
          <strong>Answer:</strong>
          <p>{rgaState.answer}</p>
          
          {/* Displaying Citations */}
          {rgaState.citations.length > 0 && (
            <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
              <strong>Sources:</strong>
              <ul>
                {rgaState.citations.map((citation) => (
                  <li key={citation.id}>
                    <a href={citation.clickUri} target="_blank" rel="noreferrer">
                      {citation.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
