import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type GeneratedAnswerState,
  loadQueryActions,
  loadSearchActions,
  loadSearchAnalyticsActions,
} from '@coveo/headless';
import { answerGenerator, headlessEngine } from '../lib/engines';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

export const AnswerGenerator = () => {
  // 1. Load history from sessionStorage
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = sessionStorage.getItem('coveo_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  const [rgaState, setRgaState] = useState<GeneratedAnswerState>();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { updateQuery, executeSearch, logSearchboxSubmit, rgaController } = useMemo(() => {
    const rgaController = answerGenerator();
    const { updateQuery } = loadQueryActions(headlessEngine);
    const { executeSearch } = loadSearchActions(headlessEngine);
    const { logSearchboxSubmit } = loadSearchAnalyticsActions(headlessEngine);
    return { rgaController, updateQuery, executeSearch, logSearchboxSubmit };
  }, []);

  // 2. Persist to Session Storage & Auto-scroll
  useEffect(() => {
    sessionStorage.setItem('coveo_chat_history', JSON.stringify(messages));
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 3. Subscribe to RGA Controller
  useEffect(() => {
    const unsubscribe = rgaController.subscribe(() => {
      setRgaState(rgaController.state);
    });
    return unsubscribe;
  }, [rgaController]);

  // 4. Finalize the Assistant's message when streaming ends
  useEffect(() => {
    if (rgaState?.answer && !rgaState.isStreaming && !rgaState.isLoading) {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        // Prevent duplicate entries of the same finished answer
        if (lastMsg?.role === 'assistant' && lastMsg.text === rgaState.answer) return prev;
        return [...prev, { role: 'assistant', text: rgaState.answer! }];
      });
    }
  }, [rgaState?.isStreaming, rgaState?.isLoading, rgaState?.answer]);

  const submitQuestion = useCallback(() => {
    const query = inputRef.current?.value || '';
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);

    headlessEngine.dispatch(updateQuery({ q: query }));
    headlessEngine.dispatch(executeSearch(logSearchboxSubmit()));

    if (inputRef.current) inputRef.current.value = '';
  }, [updateQuery, executeSearch, logSearchboxSubmit]);

  return (
    <div style={containerStyle}>
      <div style={chatHeaderStyle}>Coveo Assistant</div>
      
      <div style={chatWindowStyle}>
        {messages.map((msg, idx) => (
          <div key={idx} style={msg.role === 'user' ? userBubbleStyle : assistantBubbleStyle}>
            {msg.text}
          </div>
        ))}
        
        {/* Live Streaming Answer */}
        {(rgaState?.isLoading || rgaState?.isStreaming) && (
          <div style={assistantBubbleStyle}>
            {rgaState?.answer || '...'}
            {!rgaState?.isStreaming && rgaState?.citations && rgaState.citations.length > 0 && (
               <div style={citationContainer}>
                  {rgaState.citations.map((c, i) => (
                    <a key={i} href={c.clickUri} target="_blank" rel="noreferrer" style={citationBadge}>
                      {i + 1}
                    </a>
                  ))}
               </div>
            )}
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div style={inputAreaStyle}>
        <input
          ref={inputRef}
          style={inputStyle}
          placeholder="Ask a question..."
          onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
        />
        <button onClick={submitQuestion} style={sendButtonStyle}>↑</button>
      </div>
    </div>
  );
};

// --- Apple/Modern Styles ---
const systemFont = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

const containerStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', height: '85vh', maxWidth: '500px',
  margin: '20px auto', border: '1px solid #e5e5e5', borderRadius: '20px', 
  overflow: 'hidden', fontFamily: systemFont, backgroundColor: '#fff',
  boxShadow: '0 10px 25px rgba(0,0,0,0.05)'
};

const chatHeaderStyle: React.CSSProperties = {
  padding: '15px', textAlign: 'center', fontWeight: '600', borderBottom: '1px solid #f2f2f2', fontSize: '17px'
};

const chatWindowStyle: React.CSSProperties = {
  flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px'
};

const bubbleBase: React.CSSProperties = {
  maxWidth: '75%', padding: '10px 16px', borderRadius: '18px', fontSize: '15px', 
  lineHeight: '1.4', letterSpacing: '-0.01em', wordWrap: 'break-word'
};

const userBubbleStyle: React.CSSProperties = {
  ...bubbleBase, alignSelf: 'flex-end', backgroundColor: '#007AFF', color: 'white', borderBottomRightRadius: '4px'
};

const assistantBubbleStyle: React.CSSProperties = {
  ...bubbleBase, alignSelf: 'flex-start', backgroundColor: '#E9E9EB', color: 'black', borderBottomLeftRadius: '4px'
};

const inputAreaStyle: React.CSSProperties = {
  display: 'flex', padding: '10px 15px', alignItems: 'center', gap: '10px', backgroundColor: '#fff'
};

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 15px', borderRadius: '20px', border: '1px solid #d1d1d6', outline: 'none', fontSize: '15px'
};

const sendButtonStyle: React.CSSProperties = {
  width: '30px', height: '30px', borderRadius: '50%', border: 'none', 
  backgroundColor: '#007AFF', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '20px'
};

const citationContainer: React.CSSProperties = {
  marginTop: '8px', display: 'flex', gap: '4px'
};

const citationBadge: React.CSSProperties = {
  textDecoration: 'none', fontSize: '10px', width: '16px', height: '16px', 
  backgroundColor: 'rgba(0,0,0,0.1)', color: '#666', borderRadius: '50%',
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
