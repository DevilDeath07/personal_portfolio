import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hi! I'm your AI assistant. How can I help you today?", isBot: true }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = input;
        setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
        setInput('');
        setIsTyping(true);

        // Simple mock response logic - in real app this would call Flowise or Backend
        setTimeout(() => {
            const botResponse = getBotResponse(userMessage);
            setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
            setIsTyping(false);
        }, 1500);
    };

    const getBotResponse = (msg) => {
        const lowerMsg = msg.toLowerCase();
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) return "Hello! How can I assist you with Balamurugan's portfolio?";
        if (lowerMsg.includes('skills')) return "Balamurugan has expertise in Python, React, Node.js, and more. Check out the Skills page!";
        if (lowerMsg.includes('project')) return "He has worked on several projects like Fire-API and a Personal Portfolio. You can find them in the Projects section.";
        if (lowerMsg.includes('contact')) return "You can reach out via the Contact page or email him at balamurugankumar880@gmail.com";
        return "That's interesting! I'm still learning, but you can check out the different sections of the portfolio to learn more about Balamurugan.";
    };

    return (
        <div className="chatbot-container">
            <button
                className={`chat-toggle ${isOpen ? 'open' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? '×' : '💬'}
            </button>

            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-content">
                            <div className="chat-avatar">🤖</div>
                            <div>
                                <h4>AI Assistant</h4>
                                <span className="chat-status">Online</span>
                            </div>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>×</button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
                                <div className="message-avatar">{msg.isBot ? '🤖' : '👤'}</div>
                                <div className="message-bubble">{msg.text}</div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="chat-message bot">
                                <div className="message-avatar">🤖</div>
                                <div className="message-bubble typing">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-container">
                        <input
                            type="text"
                            className="chat-input"
                            placeholder="Type a message..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button className="chat-send" onClick={handleSend} disabled={!input.trim()}>
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
