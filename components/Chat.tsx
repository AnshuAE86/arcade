import React, { useState, useEffect, useRef } from 'react';
import { MOCK_USER } from '../constants';
import { ChatMessage } from '../types';
import { 
  PaperAirplaneIcon, 
  FaceSmileIcon, 
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Advanced moderation patterns
  const moderationRules = [
    { pattern: /badword1|badword2|foul|curse|toxic/gi, replacement: '****' },
    { pattern: /shit|fuck|damn|bitch|asshole|piss|cock|dick|pussy|vagina/gi, replacement: '****' },
    { pattern: /nude|porn|sex|sexy|horny|xxx|hot/gi, replacement: '****' },
    { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi, replacement: '[email hidden]' }, // Email protection
    { pattern: /(?:\d{3}[-.\s]??\d{3}[-.\s]??\d{4}|\(\d{3}\)\s*\d{3}[-.\s]??\d{4}|\d{10})/gi, replacement: '[phone hidden]' } // Phone protection
  ];

  const moderateMessage = (text: string) => {
    let moderatedText = text;
    let isModerated = false;
    
    moderationRules.forEach(rule => {
      if (rule.pattern.test(moderatedText)) {
        moderatedText = moderatedText.replace(rule.pattern, rule.replacement);
        isModerated = true;
      }
    });
    
    // Auto-rejection for highly offensive content (Demo logic)
    const blockedPattern = /kill|die|suicide|terrorist|hate/gi;
    if (blockedPattern.test(text)) {
      return { moderatedText: "[Message blocked by AI Safety Filter]", isModerated: true, blocked: true };
    }
    
    return { moderatedText, isModerated, blocked: false };
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const { moderatedText, isModerated, blocked } = moderateMessage(inputText);

    // If content is blocked (dangerous/hate speech), we don't send it at all
    if (blocked) {
      const systemMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'system',
        userName: 'System',
        userAvatar: '',
        text: '⚠️ Your message was blocked for violating safety guidelines.',
        timestamp: new Date().toISOString(),
        isModerated: true
      };
      setMessages(prev => [...prev, systemMessage]);
      setInputText('');
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      userAvatar: MOCK_USER.avatar,
      text: moderatedText,
      timestamp: new Date().toISOString(),
      isModerated
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 p-4 bg-cyan-500 text-slate-900 rounded-full shadow-2xl shadow-cyan-500/30 hover:scale-110 active:scale-95 transition-all group"
      >
        {isOpen ? <XMarkIcon className="w-8 h-8" /> : <ChatBubbleLeftRightIcon className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
        )}
      </button>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 transform ${
          isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-12 opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <div className="p-4 bg-slate-800 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400">
              <ChatBubbleLeftRightIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase font-orbitron">Game Lounge</h3>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <ShieldCheckIcon className="w-3 h-3 text-green-500" /> Child-Safe Mode Active
              </p>
            </div>
          </div>
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <img 
                key={i} 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                className="w-8 h-8 rounded-full border-2 border-slate-800" 
                alt="Online"
              />
            ))}
          </div>
        </div>

        <div 
          ref={scrollRef}
          className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-hide bg-slate-900/50"
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ChatBubbleLeftRightIcon className="w-16 h-16 mb-4" />
              <p className="text-sm">Start a conversation with other players!</p>
            </div>
          ) : (
            messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.userId === MOCK_USER.id ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{msg.userName}</span>
                  <span className="text-[10px] text-slate-600">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div 
                  className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${
                    msg.userId === MOCK_USER.id 
                      ? 'bg-cyan-500 text-slate-900 rounded-tr-none' 
                      : 'bg-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.isModerated && (
                  <span className="text-[9px] text-slate-600 mt-1 italic flex items-center gap-1">
                    <ShieldCheckIcon className="w-3 h-3" /> Moderated for safety
                  </span>
                )}
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} className="p-4 bg-slate-800/80 border-t border-slate-700 backdrop-blur-sm">
          <div className="relative flex items-center gap-2">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type a message..."
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:border-cyan-500 focus:outline-none transition-colors pr-24"
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button type="button" className="p-2 text-slate-500 hover:text-white transition-colors">
                <FaceSmileIcon className="w-5 h-5" />
              </button>
              <button 
                type="submit"
                disabled={!inputText.trim()}
                className="p-2 bg-cyan-500 text-slate-900 rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all shadow-lg shadow-cyan-500/20"
              >
                <PaperAirplaneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default Chat;
