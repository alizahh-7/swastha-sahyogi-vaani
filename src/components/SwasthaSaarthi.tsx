
import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Volume2, Send, Heart, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

const SwasthaSaarthi = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'hi-IN'; // Default to Hindi, but will auto-detect

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        console.log('Voice input received:', transcript);
        
        // Automatically send the voice input for processing
        handleSendMessage(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast.error('Microphone error. Please try again.');
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      toast.info('Listening... Please speak');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Detect language and set appropriate voice
      const isHindi = /[\u0900-\u097F]/.test(text);
      const isTelugu = /[\u0C00-\u0C7F]/.test(text);
      const isTamil = /[\u0B80-\u0BFF]/.test(text);
      const isBengali = /[\u0980-\u09FF]/.test(text);
      
      if (isHindi) {
        utterance.lang = 'hi-IN';
      } else if (isTelugu) {
        utterance.lang = 'te-IN';
      } else if (isTamil) {
        utterance.lang = 'ta-IN';
      } else if (isBengali) {
        utterance.lang = 'bn-IN';
      } else {
        utterance.lang = 'en-IN';
      }
      
      utterance.rate = 0.8;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const callLyzrAPI = async (userInput: string) => {
    try {
      console.log('Calling Lyzr API with input:', userInput);
      
      const response = await fetch('https://agent-prod.studio.lyzr.ai/v3/inference/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'lyzr-key-018d6e61acb543b38cc08b05a8c91e7d'
        },
        body: JSON.stringify({
          user_id: "user_health_assistant",
          agent_id: "67614bd4e4b0c6862e32c7e3",
          session_id: `session_${Date.now()}`,
          message: userInput
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('Lyzr API response:', data);
      
      if (data.response) {
        return data.response;
      } else {
        throw new Error('No response from API');
      }
    } catch (error) {
      console.error('Error calling Lyzr API:', error);
      throw error;
    }
  };

  const handleSendMessage = async (messageText: string = inputText) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const aiResponse = await callLyzrAPI(messageText);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Speak the AI response
      speakText(aiResponse);
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble helping you right now. Please try again or visit a nearby doctor.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errorMessage.text);
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-teal-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardHeader className="text-center bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold">
              <Stethoscope className="h-8 w-8" />
              SwasthaSaarthi
              <Heart className="h-8 w-8 text-red-300" />
            </CardTitle>
            <p className="text-green-100 mt-2">
              Your Health Assistant | आपका स्वास्थ्य सहायक
            </p>
          </CardHeader>
        </Card>

        {/* Welcome Message */}
        {messages.length === 0 && (
          <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Hello! I'm your health assistant
                </h3>
                <p className="text-gray-600">
                  You can tell me about your symptoms. I can help you in Hindi, English, Telugu, Tamil, and Bengali.
                </p>
                <div className="flex justify-center gap-4 text-sm text-gray-500">
                  <span>🎙️ Speak with voice</span>
                  <span>💬 Type text</span>
                  <span>🔊 Listen to response</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${
                      message.isUser
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-green-100'}`}>
                      {message.timestamp.toLocaleTimeString('en-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm max-w-xs">
                    <div className="flex items-center space-x-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Input Section */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me about your symptoms or press the mic button to speak..."
                className="resize-none border-2 border-gray-200 focus:border-green-500 rounded-lg"
                rows={3}
              />
              
              <div className="flex items-center justify-center gap-4">
                {/* Voice Input Button */}
                <Button
                  onClick={isListening ? stopListening : startListening}
                  disabled={isLoading}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    isListening
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:scale-105'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5 mr-2" />
                      Speak
                    </>
                  )}
                </Button>

                {/* Send Button */}
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isLoading}
                  className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Send
                </Button>

                {/* Speaker Button */}
                <Button
                  onClick={() => {
                    if (isSpeaking) {
                      window.speechSynthesis.cancel();
                      setIsSpeaking(false);
                    } else if (messages.length > 0) {
                      const lastAiMessage = messages.filter(m => !m.isUser).pop();
                      if (lastAiMessage) {
                        speakText(lastAiMessage.text);
                      }
                    }
                  }}
                  disabled={messages.filter(m => !m.isUser).length === 0}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    isSpeaking
                      ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:scale-105'
                  }`}
                >
                  <Volume2 className="w-5 h-5 mr-2" />
                  {isSpeaking ? 'Stop' : 'Listen'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>⚠️ This is only preliminary advice. Please consult a doctor immediately for serious problems.</p>
        </div>
      </div>
    </div>
  );
};

export default SwasthaSaarthi;
