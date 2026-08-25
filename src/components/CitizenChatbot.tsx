import React, { useState, useEffect, useRef } from 'react';
import { chatWithGroq } from '../lib/aiDispatcher';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotProps {
  lat: number;
  lng: number;
  activeBasinName: string;
  surgeHeight: number;
}

export const CitizenChatbot: React.FC<ChatbotProps> = ({ lat, lng, activeBasinName, surgeHeight }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [weatherText, setWeatherText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: 'Ask me about weather conditions or flood safety near you.'
      }]);
      fetchWeather();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,precipitation,wind_speed_10m`);
      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        const text = `Temp: ${current.temperature_2m}°C, Precip: ${current.precipitation}mm, Wind: ${current.wind_speed_10m}km/h`;
        setWeatherText(text);
      } else {
        setWeatherText('Weather data unavailable right now.');
      }
    } catch (e) {
      setWeatherText('Weather data unavailable right now.');
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const historyForGroq = [...messages.filter(m => m.id !== 'welcome'), userMsg].slice(-6).map(m => ({
      role: m.role,
      content: m.content
    }));

    const response = await chatWithGroq(historyForGroq, {
      activeBasinName,
      surgeHeight,
      weatherText
    });

    setMessages(prev => [...prev, { id: Date.now().toString() + 'bot', role: 'assistant', content: response }]);
    setIsTyping(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--safe-cyan)',
          color: '#000',
          border: 'none',
          boxShadow: '0 4px 20px rgba(0, 240, 255, 0.4)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '360px',
          height: '480px',
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--safe-cyan)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9999,
          overflow: 'hidden',
          animation: 'slideUp 0.3s ease-out'
        }}>
          <style>
            {`
              @keyframes slideUp {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}
          </style>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--grid-line)', backgroundColor: 'rgba(0, 240, 255, 0.1)' }}>
            <h3 style={{ margin: 0, color: 'var(--safe-cyan)', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💬</span> Safety Assistant
            </h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {messages.map(msg => (
              <div key={msg.id} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? 'var(--safe-cyan)' : 'var(--bg-base)',
                color: msg.role === 'user' ? '#000' : 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: '8px',
                maxWidth: '85%',
                fontSize: '14px',
                lineHeight: '1.4',
                border: msg.role === 'assistant' ? '1px solid var(--grid-line)' : 'none'
              }}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: '14px' }}>
                Typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--grid-line)', gap: '8px', backgroundColor: 'var(--bg-panel)' }}>
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask for safety advice..."
              style={{
                flex: 1,
                padding: '10px 14px',
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--grid-line)',
                borderRadius: '20px',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--safe-cyan)'}
              onBlur={e => e.target.style.borderColor = 'var(--grid-line)'}
            />
            <button 
              type="submit"
              disabled={isTyping || !input.trim()}
              style={{
                padding: '0 16px',
                backgroundColor: isTyping || !input.trim() ? 'var(--bg-base)' : 'var(--safe-cyan)',
                color: isTyping || !input.trim() ? 'var(--text-muted)' : '#000',
                border: 'none',
                borderRadius: '20px',
                cursor: isTyping || !input.trim() ? 'default' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};
