
import { Card, CardContent } from '@/components/ui/card';

export const WelcomeMessage = () => {
  return (
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
  );
};
