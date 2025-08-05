import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Smile, Paperclip, Phone, Video, User, MessageCircle, Clock } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: Date;
  type?: 'text' | 'system';
}

interface LiveChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LiveChatModal: React.FC<LiveChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! Welcome to SUSHRUSA Support. How can I help you today?',
      sender: 'support',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const supportAgent = {
    name: 'Dr. Sarah Wilson',
    role: 'Medical Support Specialist',
    avatar: '/doctor-avatar-2.svg',
    status: 'online'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simulate support response
    setTimeout(() => {
      const supportResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getAutomatedResponse(newMessage),
        sender: 'support',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, supportResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAutomatedResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('book') || msg.includes('appointment') || msg.includes('consultation')) {
      return "I'd be happy to help you book a consultation! You can book directly through our platform or I can guide you through the process. What specialty are you looking for?";
    } else if (msg.includes('price') || msg.includes('cost') || msg.includes('fee')) {
      return "Our consultation fees start from ₹500 for general medicine. Specialist consultations range from ₹600-₹900. Would you like specific pricing for a particular specialty?";
    } else if (msg.includes('emergency') || msg.includes('urgent')) {
      return "For medical emergencies, please call emergency services immediately. For urgent but non-emergency consultations, we have doctors available 24/7. Would you like me to connect you with an available doctor?";
    } else if (msg.includes('prescription') || msg.includes('medicine')) {
      return "Our doctors can provide digital prescriptions during consultations. These can be used at any pharmacy or you can order medicines through our platform for home delivery.";
    } else {
      return "Thank you for your message. Let me help you with that. Could you provide a bit more detail so I can assist you better?";
    }
  };

  const quickActions = [
    { text: 'Book Consultation', icon: '📅' },
    { text: 'Check Pricing', icon: '💰' },
    { text: 'Available Doctors', icon: '👨‍⚕️' },
    { text: 'Technical Support', icon: '🔧' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative bg-white rounded-3xl shadow-xl max-w-2xl w-full h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] p-6 rounded-t-3xl text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <img 
                  src={supportAgent.avatar} 
                  alt={supportAgent.name}
                  className="w-12 h-12 rounded-full border-2 border-white"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{supportAgent.name}</h3>
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                  <span>{supportAgent.role}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
                <Video className="w-5 h-5" />
              </Button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className="flex items-start space-x-3 max-w-[80%]">
                {message.sender === 'support' && (
                  <img 
                    src={supportAgent.avatar} 
                    alt="Support"
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                )}
                
                <div>
                  <div
                    className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-r from-[#E17726] to-[#FF8A56] text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 px-2">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {message.sender === 'user' && (
                  <div className="w-8 h-8 bg-gradient-to-br from-[#E17726] to-[#FF8A56] rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-start space-x-3">
                <img 
                  src={supportAgent.avatar} 
                  alt="Support"
                  className="w-8 h-8 rounded-full"
                />
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setNewMessage(action.text)}
                className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
              >
                <span className="mr-2">{action.icon}</span>
                {action.text}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <div className="flex items-center bg-gray-100 rounded-2xl px-4 py-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
                />
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors mr-2">
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>
                <button className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                  <Paperclip className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-[#E17726] to-[#FF8A56] hover:shadow-lg text-white p-3 rounded-2xl transition-all duration-300 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          
          <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Typically replies in 2-3 minutes</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Online now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChatModal;