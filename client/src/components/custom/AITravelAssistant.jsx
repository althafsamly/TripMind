import React, { useState } from 'react';
import api from '../../service/api';
import { Sparkles, Send, Bot, User, Loader2, X, HelpCircle, Compass } from 'lucide-react';

const AITravelAssistant = ({ trip }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            text: `Hello! I'm your AI Travel Companion. Ask me anything about your trip to ${trip?.destination?.split(',')[0] || 'this destination'}—from packing recommendations and local food must-tries to budget hacks and safety etiquette.`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const quickPrompts = [
        `What local dishes should I try in ${trip?.destination?.split(',')[0] || 'this area'}?`,
        `What are essential packing items for ${trip?.duration || 'this'} days?`,
        `Any safety precautions or cultural etiquette to know?`,
        `Best time of day to visit the main landmarks?`
    ];

    const handleSendMessage = async (textToSend) => {
        const queryText = textToSend || input;
        if (!queryText.trim() || loading) return;

        const userMsg = { role: 'user', text: queryText };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const tripContext = {
                destination: trip?.destination,
                duration: trip?.duration,
                budget: trip?.budget,
                itinerary: trip?.itinerary
            };

            const response = await api.post('/ai/assistant', {
                message: queryText,
                tripContext
            });

            if (response.data?.success && response.data?.reply) {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', text: response.data.reply }
                ]);
            } else {
                throw new Error("No response from AI assistant");
            }
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    role: 'assistant',
                    text: "Sorry, I'm having trouble connecting to the AI service right now. Please verify your internet connection or check that GEMINI_API_KEY is configured."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-urbanist font-bold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer group"
                    title="Ask AI Travel Assistant"
                >
                    <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
                    <span className="text-[13px] tracking-wide">Ask TravelBot AI</span>
                </button>
            </div>

            {/* Slide-out / Modal Drawer */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in">
                    <div 
                        className="w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
                        role="dialog"
                        aria-label="AI Travel Assistant"
                    >
                        {/* Header */}
                        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center border border-white/20 shadow-inner">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-urbanist font-bold text-white text-[16px] leading-tight flex items-center gap-1.5">
                                        TravelBot AI
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-ping"></span>
                                    </h3>
                                    <p className="text-[11px] font-inter text-gray-400">
                                        Context: {trip?.destination?.split(',')[0] || 'Destination'}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-4 py-2.5 border-b border-white/5 bg-black/40 overflow-x-auto no-scrollbar">
                            <div className="flex gap-2 w-max">
                                {quickPrompts.map((prompt, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleSendMessage(prompt)}
                                        disabled={loading}
                                        className="text-[11px] font-inter text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-full transition-colors whitespace-nowrap cursor-pointer hover:border-white/20 disabled:opacity-50"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-inter">
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                                            <Bot className="w-4 h-4 text-blue-400" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
                                            msg.role === 'user'
                                                ? 'bg-blue-600 text-white rounded-tr-xs'
                                                : 'bg-[#141414] text-gray-200 border border-white/10 rounded-tl-xs whitespace-pre-line'
                                        }`}
                                    >
                                        {msg.text}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mt-1">
                                            <User className="w-4 h-4 text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {loading && (
                                <div className="flex gap-3 items-center text-gray-400 text-[12px] bg-[#141414] border border-white/10 rounded-2xl p-3 w-fit">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                                    <span>Thinking & analyzing destination data...</span>
                                </div>
                            )}
                        </div>

                        {/* Input Box */}
                        <div className="p-4 border-t border-white/10 bg-[#050505]">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    handleSendMessage();
                                }}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={`Ask about ${trip?.destination?.split(',')[0] || 'trip'}...`}
                                    disabled={loading}
                                    className="flex-1 bg-[#141414] border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-[13px] text-white outline-none transition-all placeholder-gray-500 disabled:opacity-50"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim() || loading}
                                    className="h-10 w-10 bg-white hover:bg-gray-200 text-black rounded-xl flex items-center justify-center transition-all disabled:opacity-40 cursor-pointer shrink-0"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                            <p className="text-[10px] text-gray-500 text-center mt-2">
                                Powered by Google Gemini AI via Secure Backend API
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AITravelAssistant;
