'use client';

import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import styles from '../styles/chatbot.module.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotButtonProps {
  apiKey: string;
  characterName: string;
  characterPrompt: string;
  buttonImage?: string;
  buttonEmoji?: string;
  theme?: 'light' | 'dark';
}

export default function ChatbotButton({
  apiKey,
  characterName,
  characterPrompt,
  buttonImage,
  buttonEmoji,
  theme = 'dark',
}: ChatbotButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: characterPrompt,
            },
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not respond.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={styles.floatingButton}
        aria-label="Open chat"
        style={{
          background: theme === 'light'
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 250, 0.95) 100%)'
            : 'linear-gradient(135deg, var(--theme-color-dark, rgba(139, 0, 139, 0.9)) 0%, var(--theme-color-dark, rgba(75, 0, 130, 0.9)) 100%)',
          border: theme === 'light'
            ? '2px solid var(--theme-color, rgba(139, 0, 139, 0.8))'
            : '2px solid var(--theme-color-medium, rgba(139, 0, 139, 0.6))',
          color: theme === 'light' ? '#1a1a1a' : 'white',
          boxShadow: theme === 'light'
            ? '0 4px 20px rgba(0, 0, 0, 0.15), 0 0 40px var(--theme-color-light, rgba(139, 0, 139, 0.2))'
            : '0 4px 20px var(--theme-color-medium, rgba(139, 0, 139, 0.4)), 0 0 40px var(--theme-color-light, rgba(139, 0, 139, 0.2))',
        }}
      >
        {buttonEmoji ? (
          <span className={styles.buttonEmoji}>{buttonEmoji}</span>
        ) : buttonImage ? (
          <img src={buttonImage} alt="Chat" className={styles.buttonImage} />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div 
          className={styles.chatWindow}
          style={{
            background: theme === 'light'
              ? 'rgba(255, 255, 255, 0.98)'
              : 'rgba(10, 10, 15, 0.98)',
            border: theme === 'light'
              ? '1px solid var(--theme-color-medium, rgba(139, 0, 139, 0.4))'
              : '1px solid var(--theme-color-medium, rgba(139, 0, 139, 0.4))',
            boxShadow: theme === 'light'
              ? '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 60px var(--theme-color-light, rgba(139, 0, 139, 0.2))'
              : '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 60px var(--theme-color-light, rgba(139, 0, 139, 0.2))',
          }}
        >
          <div 
            className={styles.chatHeader}
            style={{
              background: theme === 'light'
                ? 'linear-gradient(135deg, var(--theme-color-light, rgba(139, 0, 139, 0.15)) 0%, var(--theme-color-light, rgba(75, 0, 130, 0.15)) 100%)'
                : 'linear-gradient(135deg, var(--theme-color-light, rgba(139, 0, 139, 0.3)) 0%, var(--theme-color-light, rgba(75, 0, 130, 0.3)) 100%)',
              borderBottom: theme === 'light'
                ? '1px solid var(--theme-color-light, rgba(139, 0, 139, 0.2))'
                : '1px solid var(--theme-color-light, rgba(139, 0, 139, 0.3))',
            }}
          >
            <div 
              className={styles.characterInfo}
              style={{
                color: theme === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)',
              }}
            >
              <MessageCircle size={20} />
              <span>{characterName}</span>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className={styles.closeButton}
              style={{
                color: theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.7)',
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div 
                className={styles.welcomeMessage}
                style={{
                  color: theme === 'light' ? '#666666' : 'rgba(255, 255, 255, 0.6)',
                }}
              >
                <p>Hi! I'm {characterName}. How can I help you today?</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={msg.role === 'user' ? styles.userMessage : styles.assistantMessage}
                style={
                  msg.role === 'assistant' && theme === 'light'
                    ? {
                        background: 'rgba(0, 0, 0, 0.05)',
                        color: '#1a1a1a',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }
                    : undefined
                }
              >
                {msg.content}
              </div>
            ))}
            {loading && (
              <div 
                className={styles.assistantMessage}
                style={
                  theme === 'light'
                    ? {
                        background: 'rgba(0, 0, 0, 0.05)',
                        color: '#1a1a1a',
                        border: '1px solid rgba(0, 0, 0, 0.1)',
                      }
                    : undefined
                }
              >
                <span className={styles.typing}>typing...</span>
              </div>
            )}
          </div>

          <div 
            className={styles.chatInput}
            style={{
              borderTop: theme === 'light'
                ? '1px solid var(--theme-color-light, rgba(139, 0, 139, 0.2))'
                : '1px solid var(--theme-color-light, rgba(139, 0, 139, 0.3))',
              background: theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(0, 0, 0, 0.2)',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={loading}
              className={styles.input}
              style={{
                background: theme === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.08)',
                border: theme === 'light'
                  ? '1px solid var(--theme-color-light, rgba(139, 0, 139, 0.2))'
                  : '1px solid var(--theme-color-light, rgba(139, 0, 139, 0.3))',
                color: theme === 'light' ? '#1a1a1a' : 'rgba(255, 255, 255, 0.95)',
              }}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !input.trim()} 
              className={styles.sendButton}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
