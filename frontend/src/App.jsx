import { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Book, BookOpen, RefreshCw } from 'lucide-react';

const MAX_QUERY_LENGTH = 2000;
let messageIdCounter = 0;
const generateId = () => `msg_${Date.now()}_${++messageIdCounter}`;

const formatBookName = (book) => {
  if (!book) return '';
  const isTamil = /[\u0B80-\u0BFF]/.test(book);
  if (isTamil) return book;
  
  let formatted = book.trim();
  // Insert space after leading numbers (e.g. 1CHRONICLES -> 1 CHRONICLES)
  formatted = formatted.replace(/^([1-3])([A-Za-z])/, '$1 $2');
  
  // Custom mapping for THESONGOFSOLOMON
  if (formatted.toUpperCase() === 'THESONGOFSOLOMON') {
    return 'Song of Solomon';
  }
  
  return formatted
    .toLowerCase()
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(' Of ', ' of ');
};

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [languagePreference, setLanguagePreference] = useState('auto');
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  useEffect(() => {
    // A small timeout ensures the browser has calculated the final heights 
    // of the new DOM elements (like the Biblical References card) before scrolling.
    const timer = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timer);
  }, [messages, isLoading]);

  // Build conversation history for the backend (last 6 exchanges)
  const buildHistory = useCallback(() => {
    return messages.slice(-12).map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      text: msg.text,
    }));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { id: generateId(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Cancel any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Set a 60-second timeout
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    try {
      const apiUrl = import.meta.env.DEV ? 'http://localhost:3001' : '';
      const history = buildHistory();
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage.text, languagePreference, history }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMsg = 'Network response was not ok';
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      const data = await response.json();
      
      const botMessage = { 
        id: generateId(),
        text: data.answer, 
        sender: 'bot',
        sources: data.sources 
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        const errorMessage = { 
          id: generateId(),
          text: 'The request timed out. Please try again.', 
          sender: 'bot',
          isError: true,
          retryQuery: userMessage.text,
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        console.error('Error fetching chat response:', error);
        const errorMessage = { 
          id: generateId(),
          text: `Sorry, I encountered an error: ${error.message}`, 
          sender: 'bot',
          isError: true,
          retryQuery: userMessage.text,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = (retryQuery) => {
    setInput(retryQuery);
    // Remove the error message
    setMessages(prev => prev.filter(m => !m.isError || m.retryQuery !== retryQuery));
  };

  const getPlaceholder = () => {
    if (languagePreference === 'english') return "Ask a question about the Holy Bible...";
    if (languagePreference === 'tamil') return "திருவிவிலியம் தொடர்பான உங்கள் கேள்வியை தமிழில் கேளுங்கள்...";
    return "Ask a question about the Holy Bible in English or Tamil...";
  };

  const charsRemaining = MAX_QUERY_LENGTH - input.length;
  const isOverLimit = charsRemaining < 0;

  return (
    <div className="app-container glass glass-panel">
      <header className="header">
        <div className="header-title">
          <BookOpen size={28} color="#a78bfa" />
          <span>Ask Madha</span>
        </div>
        <div className="language-selector">
          <select 
            value={languagePreference} 
            onChange={(e) => setLanguagePreference(e.target.value)}
            className="lang-select"
            disabled={isLoading}
          >
            <option value="auto">Auto-detect Language</option>
            <option value="english">English Only</option>
            <option value="tamil">Tamil Only</option>
          </select>
        </div>
      </header>

      <main className="chat-area">
        {messages.length === 0 ? (
          <div className="empty-state">
            <Book size={64} />
            <h2>Welcome to Ask Madha</h2>
            <p>Ask any question about the Holy Bible in English or Tamil.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
              <div className="message-bubble">
                {msg.sender === 'bot' ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  msg.text
                )}
                {msg.isError && msg.retryQuery && (
                  <button 
                    className="retry-btn" 
                    onClick={() => handleRetry(msg.retryQuery)}
                    title="Retry this question"
                  >
                    <RefreshCw size={14} />
                    Retry
                  </button>
                )}
              </div>
              
              {msg.sources && msg.sources.length > 0 && (
                <div className="sources-container">
                  <div className="sources-title">
                    <Book size={14} /> {msg.text && /[\u0B80-\u0BFF]/.test(msg.text) ? 'ஆதார விவிலிய குறிப்புகள்:' : 'Biblical References'}
                  </div>
                  {msg.sources.map((source, i) => (
                    <div key={i} className="source-item">
                      <span className="source-ref">{formatBookName(source.book)} {source.chapter}:{source.verse}</span>
                      <p className="source-text">{source.text.replace(/^[""']+|[""']+$/g, '')}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && (
          <div className="message-wrapper bot">
            <div className="message-bubble">
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} style={{ height: '1px', flexShrink: 0 }} />
      </main>

      <div className="input-container">
        <form onSubmit={handleSubmit} className="input-form">
          <div className="input-wrapper">
            <input
              type="text"
              className={`chat-input ${isOverLimit ? 'input-error' : ''}`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              disabled={isLoading}
              maxLength={MAX_QUERY_LENGTH + 100} // Allow slight overshoot so user sees the warning
            />
            {input.length > MAX_QUERY_LENGTH * 0.8 && (
              <span className={`char-counter ${isOverLimit ? 'counter-error' : ''}`}>
                {charsRemaining}
              </span>
            )}
          </div>
          <button type="submit" className="send-btn" disabled={!input.trim() || isLoading || isOverLimit}>
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
