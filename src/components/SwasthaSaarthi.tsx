
import React, { useState } from 'react';
import { Heart, Stethoscope } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Message } from '../types/message';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useLyzrAPI } from '../hooks/useLyzrAPI';
import { WelcomeMessage } from './WelcomeMessage';
import { ChatMessages } from './ChatMessages';
import { InputControls } from './InputControls';

const SwasthaSaarthi = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { callLyzrAPI } = useLyzrAPI();
  const { isSpeaking, speakText, stopSpeaking } = useSpeechSynthesis();

  const handleVoiceResult = (transcript: string) => {
    setInputText(transcript);
    handleSendMessage(transcript);
  };

  const { isListening, startListening, stopListening } = useSpeechRecognition(handleVoiceResult);

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
      console.log('AI Response received:', aiResponse);
      
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
      console.error('Error in handleSendMessage:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am having trouble helping you right now. Please try again or visit a nearby doctor.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errorMessage.text);
      toast.error('Connection error - please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else if (messages.length > 0) {
      const lastAiMessage = messages.filter(m => !m.isUser).pop();
      if (lastAiMessage) {
        speakText(lastAiMessage.text);
      }
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
              Your AI Health Assistant
            </p>
          </CardHeader>
        </Card>

        {/* Welcome Message */}
        {messages.length === 0 && <WelcomeMessage />}

        {/* Chat Messages */}
        <ChatMessages messages={messages} isLoading={isLoading} />

        {/* Input Section */}
        <InputControls
          inputText={inputText}
          setInputText={setInputText}
          isListening={isListening}
          isLoading={isLoading}
          isSpeaking={isSpeaking}
          messages={messages}
          onStartListening={startListening}
          onStopListening={stopListening}
          onSendMessage={() => handleSendMessage()}
          onToggleSpeak={handleToggleSpeak}
        />

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>⚠️ This is only preliminary advice. Please consult a doctor immediately for serious problems.</p>
        </div>
      </div>
    </div>
  );
};

export default SwasthaSaarthi;
