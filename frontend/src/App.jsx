import { useCallback, useEffect, useRef, useState } from 'react';

const API_BASE = 'https://low-costlasers-ai-chatbot.vercel.app';

const LANG_GREETINGS = {
  en: "Hello! I'm ARIA, your LowCostLasers AI consultant. How can I help you today?",
  es: '¡Hola! Soy ARIA, tu consultora de IA de LowCostLasers. ¿Cómo puedo ayudarte hoy?',
  fr: 'Bonjour! Je suis ARIA, votre consultante IA de LowCostLasers. Comment puis-je vous aider?',
  de: 'Hallo! Ich bin ARIA, Ihre KI-Beraterin bei LowCostLasers. Wie kann ich Ihnen helfen?',
  pt: 'Olá! Sou ARIA, sua consultora de IA da LowCostLasers. Como posso ajudá-lo hoje?',
  ar: 'مرحباً! أنا ARIA، مستشارتك الذكية في LowCostLasers. كيف يمكنني مساعدتك اليوم؟',
  zh: '您好！我是ARIA，您的LowCostLasers AI顾问。今天我能为您提供什么帮助？',
};

function formatBotMessage(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(
      /`(.*?)`/g,
      '<code style="background:#1e2d3d;padding:2px 6px;border-radius:4px;font-size:12px">$1</code>'
    )
    .replace(
      /^### (.*$)/gm,
      '<h4 style="font-family:Syne,sans-serif;color:var(--accent-cyan);font-size:13px;margin:8px 0 4px">$1</h4>'
    )
    .replace(
      /^## (.*$)/gm,
      '<h3 style="font-family:Syne,sans-serif;color:var(--accent-cyan);margin:10px 0 6px">$1</h3>'
    )
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '<br><br>')
    .replace(/\n/g, '<br>')
    .replace(/---/g, '<hr/>')
    .replace(
      /\[(.*?)\]\((.*?)\)/g,
      '<a href="$2" target="_blank" rel="noopener">$1 ↗</a>'
    );
}

function WelcomeScreen({ onChip }) {
  return (
    <div className="welcome-screen" id="welcome-screen">
      <div className="welcome-avatar">
        <img src="/logo.png" alt="LowCostLasers Logo" style={{ width: '90px', height: '90px', objectFit: 'contain', borderRadius: '20px' }} />
      </div>
      <h1>Hi, I&apos;m ARIA</h1>
      <p>
        Your dedicated AI consultant for LowCostLasers.com. I can help you find the perfect pre-owned
        aesthetic or medical laser equipment, get financing, sell your equipment, or schedule a repair —
        in any language.
      </p>
      <div className="chips">
        <div className="chip" onClick={() => onChip('What laser equipment do you currently have in stock?')}>
          🔍 Browse Inventory
        </div>
        <div className="chip" onClick={() => onChip('I want to sell my used laser equipment')}>
          💰 Sell Equipment
        </div>
        <div className="chip" onClick={() => onChip('What financing options are available?')}>
          🏦 Financing Options
        </div>
        <div className="chip" onClick={() => onChip('How much does shipping cost and how does it work?')}>
          📦 Shipping Info
        </div>
        <div className="chip" onClick={() => onChip('My laser needs repair. Can you help?')}>
          🔧 Book a Repair
        </div>
        <div className="chip" onClick={() => onChip('Compare hair removal lasers for a medspa')}>
          ✨ Compare Machines
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const sessionIdRef = useRef(`sess_${Math.random().toString(36).substr(2, 9)}`);
  const conversationHistoryRef = useRef([]);
  const [messages, setMessages] = useState([]);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [typingId, setTypingId] = useState(null);
  const [currentLanguage, setCurrentLanguage] = useState('auto');
  const [chatInput, setChatInput] = useState('');
  const [sendDisabled, setSendDisabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [leadName, setLeadName] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadInterest, setLeadInterest] = useState('');
  const [leadMessage, setLeadMessage] = useState('');
  const [toasts, setToasts] = useState([]);

  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = messagesRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingId, showWelcome, scrollToBottom]);

  const showToast = useCallback((msg, type = 'success') => {
    const id = `toast_${Date.now()}`;
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4500);
  }, []);

  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [chatInput, autoResize]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onDocClick = (e) => {
      const sidebar = document.getElementById('sidebar');
      if (
        sidebarOpen &&
        sidebar &&
        !sidebar.contains(e.target) &&
        !e.target.classList.contains('menu-toggle')
      ) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [sidebarOpen]);

  const addMessage = useCallback((role, content) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setMessages((m) => [...m, { id, role, content, time }]);
  }, []);

  const sendMessage = useCallback(
    async (overrideText) => {
      const text = (overrideText != null ? String(overrideText) : chatInput).trim();
      if (!text || isTyping) return;

      setShowWelcome(false);
      addMessage('user', text);
      conversationHistoryRef.current = [...conversationHistoryRef.current, { role: 'user', content: text }];

      setChatInput('');
      setSendDisabled(true);
      setIsTyping(true);

      const tid = `typing_${Date.now()}`;
      setTypingId(tid);

      try {
        let messagesPayload = [...conversationHistoryRef.current];

        if (currentLanguage !== 'auto' && LANG_GREETINGS[currentLanguage]) {
          messagesPayload = [
            {
              role: 'system',
              content: `IMPORTANT: The user has selected ${currentLanguage} as their preferred language. Respond ONLY in ${currentLanguage} for this entire conversation.`,
            },
            ...messagesPayload,
          ];
        }

        const res = await fetch(`${API_BASE}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: messagesPayload, sessionId: sessionIdRef.current }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data = await res.json();

        setTypingId(null);
        addMessage('bot', data.reply);
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          { role: 'assistant', content: data.reply },
        ];

        const lowerMsg = text.toLowerCase();
        if (
          (lowerMsg.includes('buy') ||
            lowerMsg.includes('price') ||
            lowerMsg.includes('quote') ||
            lowerMsg.includes('financing')) &&
          conversationHistoryRef.current.length > 4
        ) {
          setTimeout(() => {
            const modal = document.getElementById('lead-modal');
            if (modal && !modal.classList.contains('active-session')) {
              // subtle suggestion after a few exchanges
            }
          }, 2000);
        }
      } catch (err) {
        setTypingId(null);
        addMessage(
          'bot',
          '⚠️ Sorry, I encountered a connection issue. Please try again or call us directly at **786.357.1224**.'
        );
        console.error('Chat error:', err);
      }

      setIsTyping(false);
      setSendDisabled(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [chatInput, isTyping, currentLanguage, addMessage]
  );

  const sendQuick = useCallback(
    (msg) => {
      setChatInput(msg);
      sendMessage(msg);
    },
    [sendMessage]
  );

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    conversationHistoryRef.current = [];
    setMessages([]);
    setShowWelcome(true);
    showToast('Chat cleared', 'success');
  };

  const toggleSidebar = () => {
    setSidebarOpen((o) => !o);
  };

  const openLeadModal = () => setLeadModalOpen(true);
  const closeLeadModal = () => setLeadModalOpen(false);

  const submitLead = async () => {
    const name = leadName.trim();
    const email = leadEmail.trim();
    const phone = leadPhone.trim();
    const interest = leadInterest;
    const message = leadMessage.trim();

    if (!email) {
      showToast('Please enter your email address', 'error');
      return;
    }

    const leadData = { name, email, phone, interest, message, sessionId: sessionIdRef.current };

    try {
      const res = await fetch(`${API_BASE}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });

      if (res.ok) {
        closeLeadModal();
        showToast('✅ Request submitted! Our team will contact you within 24 hours.', 'success');

        setShowWelcome(false);
        addMessage(
          'bot',
          `Thank you, **${name || 'friend'}**! 🎉 We've received your request and our team will reach out to **${email}** within 24 hours. In the meantime, feel free to keep asking me anything about our inventory, financing, or services!`
        );
        conversationHistoryRef.current = [
          ...conversationHistoryRef.current,
          {
            role: 'assistant',
            content: `Thank you! We've received your lead information and will follow up shortly.`,
          },
        ];

        setLeadName('');
        setLeadEmail('');
        setLeadPhone('');
        setLeadMessage('');
        setLeadInterest('');
      } else {
        showToast('Submission failed. Please call 786.357.1224 directly.', 'error');
      }
    } catch (err) {
      closeLeadModal();
      showToast('Request noted! Please also call 786.357.1224 or email info@lowcostlasers.com', 'success');
      console.error('Lead submit error:', err);
    }
  };

  const charCount = `${chatInput.length}/2000`;

  return (
    <>
      <div className="app">
        <aside className={`sidebar${sidebarOpen ? ' open' : ''}`} id="sidebar">
          <div className="sidebar-header">
            <div className="logo-wrap">
              <div className="logo-icon">
                <img src="/logo.png" alt="LowCostLasers" style={{ width: '44px', height: '44px', objectFit: 'contain', borderRadius: '10px' }} />
              </div>
              <div className="logo-text">
                <h2>LOWCOSTLASERS</h2>
                <span>AI Sales Assistant</span>
              </div>
            </div>
            <div className="status-bar">
              <div className="status-dot" />
              <span>ARIA is Online · GPT-4o Powered</span>
            </div>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Quick Actions</div>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('Show me your best hair removal lasers under $30,000')}
            >
              <span className="q-icon">💡</span> Hair Removal Lasers
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('I want to sell my used aesthetic laser equipment')}
            >
              <span className="q-icon">💰</span> Sell My Equipment
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('Tell me about financing options for equipment purchases')}
            >
              <span className="q-icon">🏦</span> Get Financing
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('I need my laser repaired — who can help?')}
            >
              <span className="q-icon">🔧</span> Repair Services
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('What tattoo removal machines do you have available?')}
            >
              <span className="q-icon">🎯</span> Tattoo Removal
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('Tell me about body contouring and RF machines you have')}
            >
              <span className="q-icon">✨</span> Body Contouring
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('What diagnostic imaging equipment do you offer?')}
            >
              <span className="q-icon">🏥</span> Diagnostic Imaging
            </button>
            <button
              type="button"
              className="quick-btn"
              onClick={() => sendQuick('How does your shipping and crating process work?')}
            >
              <span className="q-icon">📦</span> Shipping & Crating
            </button>
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Popular Equipment</div>
            <div>
              <span
                className="inv-tag"
                onClick={() => sendQuick('Tell me about the Lumenis M22 Stellar you have at $55,000')}
              >
                🔬 M22 Stellar $55K
              </span>
              <span
                className="inv-tag"
                onClick={() => sendQuick('Tell me about the Candela GentleLase at $24,000')}
              >
                💫 GentleLase $24K
              </span>
              <span
                className="inv-tag"
                onClick={() => sendQuick('Tell me about the InMode Empower RF Pro at $79,000')}
              >
                ⚡ InMode $79K
              </span>
              <span
                className="inv-tag"
                onClick={() => sendQuick('What is the PicoSure 2013 system and is it worth buying?')}
              >
                🎯 PicoSure $30K
              </span>
              <span
                className="inv-tag"
                onClick={() => sendQuick('Tell me about the BTL EmSculpt RF machine at $63,000')}
              >
                💪 EmSculpt $63K
              </span>
              <span
                className="inv-tag"
                onClick={() => sendQuick('Tell me about the Candela VBeam Prima at $47,000')}
              >
                🌊 VBeam $47K
              </span>
            </div>
          </div>

          <div className="sidebar-footer">
            <button type="button" className="lead-btn" onClick={openLeadModal}>
              📋 Request a Quote / Free Consult
            </button>
            <div className="contact-info">
              <a href="tel:7863571224">📞 786.357.1224</a>
              <a href="mailto:info@lowcostlasers.com">✉ info@lowcostlasers.com</a>
              <div>🕐 Sun–Mon 9am–11pm</div>
              <div>📍 Miami Lakes, FL 33016</div>
            </div>
          </div>
        </aside>

        <main className="chat-main">
          <div className="topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button type="button" className="menu-toggle" onClick={toggleSidebar} aria-label="Menu">
                ☰
              </button>
              <div className="topbar-title">
                <span>ARIA</span> — Aesthetic Resource & Investment Assistant
              </div>
            </div>
            <div className="topbar-actions">
              <select
                className="lang-select"
                id="lang-select"
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
              >
                <option value="auto">🌐 Auto Language</option>
                <option value="en">🇺🇸 English</option>
                <option value="es">🇪🇸 Español</option>
                <option value="fr">🇫🇷 Français</option>
                <option value="de">🇩🇪 Deutsch</option>
                <option value="pt">🇧🇷 Português</option>
                <option value="ar">🇸🇦 العربية</option>
                <option value="zh">🇨🇳 中文</option>
              </select>
              <button type="button" className="topbar-btn" onClick={clearChat}>
                🗑 Clear
              </button>
              <button type="button" className="topbar-btn" onClick={openLeadModal}>
                📋 Get Quote
              </button>
            </div>
          </div>

          <div className="messages-scroll" id="messages" ref={messagesRef}>
            {showWelcome && messages.length === 0 && <WelcomeScreen onChip={sendQuick} />}
            {messages.map((m) => {
              return (
                <div key={m.id} className={`msg ${m.role}`}>
                  <div className="msg-avatar">
                    {m.role === 'bot' ? (
                      <img src="/logo.png" alt="ARIA" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', background: '#0a1628' }} />
                    ) : '👤'}
                  </div>
                  <div className="msg-content">
                    {m.role === 'bot' ? (
                      <div
                        className="msg-bubble"
                        dangerouslySetInnerHTML={{ __html: formatBotMessage(m.content) }}
                      />
                    ) : (
                      <div className="msg-bubble">{m.content}</div>
                    )}
                    <div className="msg-time">{m.time}</div>
                  </div>
                </div>
              );
            })}
            {typingId && (
              <div className="msg bot" id={typingId}>
                <div className="msg-avatar">
                  <img src="/logo.png" alt="ARIA" style={{ width: '36px', height: '36px', objectFit: 'contain', borderRadius: '8px', background: '#0a1628' }} />
                </div>
                <div className="msg-content">
                  <div className="typing-indicator">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="input-area">
            <div className="input-bar">
              <textarea
                id="chat-input"
                ref={inputRef}
                placeholder="Ask about equipment, pricing, financing, repairs, or selling your laser..."
                rows={1}
                maxLength={2000}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKey}
                onInput={autoResize}
              />
              <div className="input-actions">
                <button
                  type="button"
                  className="send-btn"
                  id="send-btn"
                  disabled={sendDisabled}
                  onClick={() => sendMessage()}
                  title="Send message"
                >
                  ➤
                </button>
              </div>
            </div>
            <div className="input-footer">
              <span className="input-hint">
                Enter to send · Shift+Enter for new line · Available in any language
              </span>
              <span className="char-count" id="char-count">
                {charCount}
              </span>
            </div>
          </div>
        </main>
      </div>

      <div
        className={`modal-overlay${leadModalOpen ? ' active' : ''}`}
        id="lead-modal"
        onClick={(e) => {
          if (e.target === e.currentTarget) closeLeadModal();
        }}
        role="presentation"
      >
        <div className="modal">
          <div className="modal-header">
            <div>
              <h3>
                Get a <span>Free Quote</span>
              </h3>
              <p>Our team will reach out within 24 hours</p>
            </div>
            <button type="button" className="close-modal" onClick={closeLeadModal}>
              ✕
            </button>
          </div>
          <div className="form-group">
            <label htmlFor="lead-name">Full Name *</label>
            <input
              type="text"
              id="lead-name"
              placeholder="Dr. Jane Smith"
              value={leadName}
              onChange={(e) => setLeadName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lead-email">Email Address *</label>
            <input
              type="email"
              id="lead-email"
              placeholder="jane@clinic.com"
              value={leadEmail}
              onChange={(e) => setLeadEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lead-phone">Phone Number</label>
            <input
              type="tel"
              id="lead-phone"
              placeholder="+1 (305) 000-0000"
              value={leadPhone}
              onChange={(e) => setLeadPhone(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lead-interest">I&apos;m interested in...</label>
            <select
              id="lead-interest"
              value={leadInterest}
              onChange={(e) => setLeadInterest(e.target.value)}
            >
              <option value="">Select one</option>
              <option value="buying">Buying Equipment</option>
              <option value="selling">Selling Equipment</option>
              <option value="financing">Equipment Financing</option>
              <option value="repair">Repair / Service</option>
              <option value="diagnostic">Diagnostic Imaging</option>
              <option value="general">General Inquiry</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="lead-message">Tell us more (optional)</label>
            <textarea
              id="lead-message"
              placeholder="E.g. Looking for a hair removal laser for my medspa in Miami..."
              value={leadMessage}
              onChange={(e) => setLeadMessage(e.target.value)}
            />
          </div>
          <button type="button" className="submit-lead" onClick={submitLead}>
            Submit — Get Free Consultation
          </button>
        </div>
      </div>

      <div className="toast-container" id="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span>{t.type === 'success' ? '✓' : '⚠'}</span> {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}
