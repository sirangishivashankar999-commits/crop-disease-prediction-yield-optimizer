import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  X,
  Minus,
  RotateCcw,
  Sprout,
  Bot,
  AlertOctagon,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { api } from '../../services/api';

const WELCOME_MESSAGE = {
  id: 'msg-welcome',
  role: 'assistant',
  content: `Hello! I'm **CropWise AI** 🌱\n\nI can help you understand crop diseases, leaf scan results, yield predictions, crop recommendations, and general agriculture-related questions.\n\nHow can I help you today?`,
  timestamp: 'Just now',
  suggestions: [
    '🌱 Ask about a crop',
    '🔬 Explain my disease result',
    '📊 Explain my yield prediction',
    '💡 Explain my recommendation',
    '🧑‍🌾 Ask a farming question'
  ]
};

export default function CropWiseAIAssistant({
  activeTab,
  setActiveTab,
  insightsData,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen || setInternalIsOpen;

  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUserPrompt, setLastUserPrompt] = useState('');
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll chat to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  // Alert indicator if new disease alerts are active
  useEffect(() => {
    if (insightsData?.disease_alerts_active && insightsData.disease_alerts_active > 0) {
      setHasUnreadAlert(true);
    }
  }, [insightsData]);

  const handleSendMessage = async (textToSend) => {
    const messageText = (textToSend || input).trim();
    if (!messageText || isLoading) return;

    setError(null);
    setInput('');
    setLastUserPrompt(messageText);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Optimistically update conversation
    const updatedHistory = [...messages, userMessage];
    setMessages(updatedHistory);
    setIsLoading(true);

    try {
      // Prepare payload with minimal conversational memory
      const payloadMessages = updatedHistory.slice(-8).map((m) => ({
        role: m.role,
        content: m.content
      }));

      const contextPayload = {
        current_tab: activeTab,
        disease_alerts_active: insightsData?.disease_alerts_active || 0
      };

      const response = await api.chatWithAI(payloadMessages, contextPayload);

      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: response.status,
        referenced_data: response.referenced_data,
        suggestions: response.suggestions || []
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError(err.message || 'Sorry, CropWise AI is temporarily unavailable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickPrompt = (prompt) => {
    const promptMap = {
      'Ask about a crop': 'Tell me about the best crops to cultivate, their soil and seasonal requirements, and key management practices.',
      'Explain my disease result': 'What does my latest leaf disease scan result mean and what treatment should I apply?',
      'Explain my yield prediction': 'Explain my latest crop yield prediction and how I can optimize harvest production.',
      'Explain my recommendation': 'What agronomic recommendations do you have for soil health, irrigation, and crop care?',
      'Ask a farming question': 'What are essential daily farming tips for high crop productivity and pest prevention?'
    };
    const cleanPrompt = prompt.replace(/^[\p{Emoji}\s]+/u, '').trim();
    const expandedPrompt = promptMap[cleanPrompt] || promptMap[prompt] || cleanPrompt || prompt;
    handleSendMessage(expandedPrompt);
  };

  const handleClearChat = () => {
    setMessages([WELCOME_MESSAGE]);
    setError(null);
  };

  const handleRetry = () => {
    if (lastUserPrompt) {
      handleSendMessage(lastUserPrompt);
    }
  };

  // Helper to format simple markdown (**bold**, newlines, bullet lists)
  const formatMessageText = (content) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, lIdx) => {
      // Replace **bold** with <strong>
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      // Bullet lists
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={lIdx} style={{ display: 'flex', gap: '8px', margin: '3px 0', paddingLeft: '4px' }}>
            <span style={{ color: '#059669', fontWeight: 'bold' }}>•</span>
            <div style={{ flex: 1 }}>{formattedParts}</div>
          </div>
        );
      }

      // Quote / Tip boxes
      if (line.trim().startsWith('>')) {
        return (
          <div
            key={lIdx}
            style={{
              margin: '6px 0',
              padding: '8px 12px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              borderLeft: '3px solid #10b981',
              borderRadius: '4px',
              fontSize: '0.8rem',
            }}
          >
            {formattedParts}
          </div>
        );
      }

      return (
        <div key={lIdx} style={{ minHeight: line.trim() === '' ? '8px' : 'auto', margin: '2px 0' }}>
          {formattedParts}
        </div>
      );
    });
  };

  return (
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setHasUnreadAlert(false);
          }}
          className="cropwise-ai-fab"
          aria-label="Ask CropWise AI Assistant"
          title="Ask CropWise AI (Agriculture Assistant)"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 45,
            height: '52px',
            padding: '0 20px',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.45), 0 8px 10px -6px rgba(5, 150, 105, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            fontWeight: 700,
            fontSize: '0.9rem',
          }}
        >
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={20} color="#ffffff" />
            <span
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#34d399',
                border: '2px solid #059669',
              }}
            />
          </div>
          <span>Ask CropWise AI</span>

          {hasUnreadAlert && (
            <span
              style={{
                padding: '2px 6px',
                borderRadius: '9999px',
                backgroundColor: '#ef4444',
                color: '#ffffff',
                fontSize: '0.675rem',
                fontWeight: 700,
              }}
            >
              Alert
            </span>
          )}
        </button>
      )}

      {/* Floating Chat Panel */}
      {isOpen && (
        <div
          className="cropwise-ai-panel"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '420px',
            maxWidth: 'calc(100vw - 32px)',
            height: '620px',
            maxHeight: 'calc(100vh - 48px)',
            backgroundColor: 'var(--surface-card)',
            borderRadius: '20px',
            border: '1px solid var(--border-subtle)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            zIndex: 60,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'cropwiseAiSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 18px',
              background: 'linear-gradient(135deg, #064e3b 0%, #065f46 60%, #047857 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(6px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)',
                }}
              >
                <Sprout size={20} color="#6ee7b7" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff' }}>
                    CropWise AI
                  </h3>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      backgroundColor: 'rgba(16, 185, 129, 0.25)',
                      color: '#a7f3d0',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      border: '1px solid rgba(52, 211, 153, 0.3)',
                    }}
                  >
                    <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                    Active
                  </span>
                </div>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.725rem', color: '#a7f3d0' }}>
                  Agronomic Intelligence & Advisory
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handleClearChat}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Clear conversation"
              >
                <Trash2 size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                }}
                title="Close chat"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Active Telemetry Banner (If real scan or yield data is active) */}
          {insightsData && (
            <div
              style={{
                backgroundColor: 'var(--surface-bg)',
                borderBottom: '1px solid var(--border-subtle)',
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <CheckCircle2 size={13} color="#10b981" />
                <span>Connected to Field Telemetry</span>
              </span>
              <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                {activeTab.toUpperCase()} VIEW
              </span>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              backgroundColor: 'var(--surface-bg)',
            }}
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    backgroundColor: msg.role === 'user' ? '#059669' : 'var(--surface-card)',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-main)',
                    fontSize: '0.835rem',
                    lineHeight: 1.5,
                    border: msg.role === 'user' ? 'none' : '1px solid var(--border-subtle)',
                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(5, 150, 105, 0.25)' : 'var(--shadow-sm)',
                    wordBreak: 'break-word',
                  }}
                >
                  {formatMessageText(msg.content)}

                  {/* Quick Action Navigation Buttons if AI specifically explains tools or records */}
                  {msg.role === 'assistant' && msg.id !== 'msg-welcome' && (
                    (msg.referenced_data?.disease || msg.referenced_data?.has_disease_data || msg.content.includes('Disease Detection') || msg.referenced_data?.yield || msg.referenced_data?.has_yield_data || msg.content.includes('Yield Optimizer')) && (
                      <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {(msg.referenced_data?.disease || msg.referenced_data?.has_disease_data || msg.content.includes('Disease Detection')) && setActiveTab && (
                          <button
                            onClick={() => {
                              setActiveTab('disease');
                              setIsOpen(false);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #fecdd3',
                              backgroundColor: '#fff1f2',
                              color: '#9f1239',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <AlertOctagon size={12} />
                            Open Disease Scanner
                            <ArrowRight size={10} />
                          </button>
                        )}

                        {(msg.referenced_data?.yield || msg.referenced_data?.has_yield_data || msg.content.includes('Yield Optimizer')) && setActiveTab && (
                          <button
                            onClick={() => {
                              setActiveTab('yield');
                              setIsOpen(false);
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #a7f3d0',
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              fontSize: '0.725rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <TrendingUp size={12} />
                            Open Yield Optimizer
                            <ArrowRight size={10} />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>

                {/* Timestamp */}
                <span
                  style={{
                    fontSize: '0.675rem',
                    color: 'var(--text-light)',
                    marginTop: '4px',
                    padding: '0 4px',
                  }}
                >
                  {msg.timestamp}
                </span>

                {/* Quick Action Suggestion Chips (If available on assistant message) */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '6px',
                      marginTop: '8px',
                      maxWidth: '90%',
                    }}
                  >
                    {msg.suggestions.map((sug, sIdx) => (
                      <button
                        key={sIdx}
                        onClick={() => handleQuickPrompt(sug)}
                        style={{
                          backgroundColor: 'var(--surface-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '9999px',
                          padding: '5px 12px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: 'var(--text-main)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#10b981';
                          e.currentTarget.style.backgroundColor = 'var(--primary-50)';
                          e.currentTarget.style.color = '#047857';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'var(--border-subtle)';
                          e.currentTarget.style.backgroundColor = 'var(--surface-card)';
                          e.currentTarget.style.color = 'var(--text-main)';
                        }}
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px' }}>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    backgroundColor: 'var(--surface-card)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span className="cropwise-ai-dot" />
                  <span className="cropwise-ai-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="cropwise-ai-dot" style={{ animationDelay: '0.4s' }} />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    CropWise AI is thinking...
                  </span>
                </div>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  backgroundColor: '#fff1f2',
                  border: '1px solid #fecdd3',
                  borderRadius: '12px',
                  fontSize: '0.8rem',
                  color: '#9f1239',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <span>{error}</span>
                <button
                  onClick={handleRetry}
                  style={{
                    backgroundColor: '#e11d48',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '0.725rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    flexShrink: 0,
                  }}
                >
                  <RotateCcw size={12} />
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'var(--surface-card)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              gap: '8px',
              alignItems: 'center',
            }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask CropWise AI about crops, diseases, yields..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-bg)',
                color: 'var(--text-main)',
                fontSize: '0.835rem',
                outline: 'none',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#10b981')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-subtle)')}
            />

            <button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                backgroundColor: input.trim() && !isLoading ? '#059669' : 'var(--surface-bg)',
                color: input.trim() && !isLoading ? '#ffffff' : 'var(--text-light)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              title="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes cropwiseAiSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .cropwise-ai-fab:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px -4px rgba(5, 150, 105, 0.5), 0 10px 12px -6px rgba(5, 150, 105, 0.3) !important;
        }
        .cropwise-ai-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #059669;
          display: inline-block;
          animation: cropwiseAiBounce 1.2s infinite ease-in-out;
        }
        @keyframes cropwiseAiBounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1.0);
          }
        }
        @media (max-width: 640px) {
          .cropwise-ai-panel {
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100% !important;
            border-radius: 0 !important;
          }
          .cropwise-ai-fab {
            bottom: 16px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </>
  );
}
