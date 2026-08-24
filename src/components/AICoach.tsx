import React, { useState } from 'react';
import { Bot, Send, X, Key } from 'lucide-react';
import type { UserProgress, ChatMessage } from '../types/system';
import { askGeminiAICoach } from '../utils/geminiApi';

interface AICoachProps {
  progress: UserProgress;
  isOpen: boolean;
  onClose: () => void;
  onUpdateApiKey: (key: string) => void;
}

export const AICoach: React.FC<AICoachProps> = ({ progress, isOpen, onClose, onUpdateApiKey }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'system',
      text: `[SYSTEM ONLINE] Greetings Player ${progress.profile.name}. I am your Gemini AI System Coach. I analyze your physical metrics (BMI: ${progress.bmi}) and hostel training plan. How may I assist your awakening?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState<boolean>(false);
  const [tempApiKey, setTempApiKey] = useState<string>(progress.geminiApiKey || '');

  if (!isOpen) return null;

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const reply = await askGeminiAICoach(textToSend, progress, tempApiKey.trim() || progress.geminiApiKey);
      const systemReply: ChatMessage = {
        id: `sys-${Date.now()}`,
        sender: 'system',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, systemReply]);
    } catch (err) {
      console.error('AI Coach error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = () => {
    onUpdateApiKey(tempApiKey.trim());
    setShowApiKeyInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg h-[85vh] glass-panel rounded-2xl flex flex-col border border-purple-500/40 shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="p-4 bg-purple-950/40 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-purple-900/60 text-purple-300 border border-purple-400/40">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100 flex items-center space-x-2 font-display">
                <span>SYSTEM AI COACH</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                  GEMINI 1.5
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Personalized Calisthenics & Hostel Nutrition Assistant</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowApiKeyInput(!showApiKeyInput)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:text-purple-300 transition cursor-pointer"
              title="Configure Gemini API Key"
            >
              <Key className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* API Key configuration drawer */}
        {showApiKeyInput && (
          <div className="p-4 bg-slate-900 border-b border-slate-800 space-y-3 animate-fade-in">
            <div className="text-xs text-slate-300">
              To activate direct Google Gemini responses, input a Google AI Studio API Key. If left empty, a static system coach fallback is utilized.
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="AIzaSy..."
                value={tempApiKey}
                onChange={e => setTempApiKey(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-400"
              />
              <button
                onClick={handleSaveApiKey}
                className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-mono font-bold cursor-pointer"
              >
                SAVE
              </button>
            </div>
          </div>
        )}

        {/* Messages list */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl text-xs font-sans leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
              </div>
              <span className="text-[9px] text-slate-500 mt-1 font-mono">{msg.timestamp}</span>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs font-mono py-2">
              <Bot className="w-4 h-4 animate-spin text-purple-400" />
              <span>THE SYSTEM is calculating response...</span>
            </div>
          )}
        </div>

        {/* Chat input box */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-900/40 flex gap-2">
          <input
            type="text"
            placeholder="Ask about calisthenics forms, mess adjustments, or routines..."
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none rounded-xl px-4 py-2.5 text-xs text-white"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 disabled:opacity-50 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
