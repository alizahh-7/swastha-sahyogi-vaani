
import { Mic, MicOff, Volume2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Message } from '../types/message';

interface InputControlsProps {
  inputText: string;
  setInputText: (text: string) => void;
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  messages: Message[];
  onStartListening: () => void;
  onStopListening: () => void;
  onSendMessage: () => void;
  onToggleSpeak: () => void;
}

export const InputControls = ({
  inputText,
  setInputText,
  isListening,
  isLoading,
  isSpeaking,
  messages,
  onStartListening,
  onStopListening,
  onSendMessage,
  onToggleSpeak
}: InputControlsProps) => {
  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardContent className="p-6">
        <div className="space-y-4">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            placeholder="Tell me about your symptoms or press the mic button to speak..."
            className="resize-none border-2 border-gray-200 focus:border-green-500 rounded-lg"
            rows={3}
          />
          
          <div className="flex items-center justify-center gap-4">
            {/* Voice Input Button */}
            <Button
              onClick={isListening ? onStopListening : onStartListening}
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
              onClick={onSendMessage}
              disabled={!inputText.trim() || isLoading}
              className="px-6 py-3 rounded-full font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:scale-105 transition-all duration-300"
            >
              <Send className="w-5 h-5 mr-2" />
              Send
            </Button>

            {/* Speaker Button */}
            <Button
              onClick={onToggleSpeak}
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
  );
};
