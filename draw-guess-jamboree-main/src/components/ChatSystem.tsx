import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system';
}

interface Guess {
  playerId: string;
  playerName: string;
  guess: string;
  timestamp: number;
  isCorrect?: boolean;
}

interface ChatSystemProps {
  messages: ChatMessage[];
  guesses: Guess[];
  onSendMessage: (message: string) => void;
  currentPlayerId: string;
  isGuessingPhase: boolean;
}

const ChatSystem: React.FC<ChatSystemProps> = ({ 
  messages, 
  guesses, 
  onSendMessage, 
  currentPlayerId,
  isGuessingPhase 
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'guesses'>('guesses');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, guesses]);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card className="h-96 flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageCircle className="w-5 h-5" />
            Game Chat
          </CardTitle>
          <div className="flex space-x-1">
            <Button
              variant={activeTab === 'guesses' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('guesses')}
              className="text-xs"
            >
              Guesses {guesses.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{guesses.length}</Badge>}
            </Button>
            <Button
              variant={activeTab === 'chat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('chat')}
              className="text-xs"
            >
              Chat {messages.filter(m => m.type === 'chat').length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{messages.filter(m => m.type === 'chat').length}</Badge>}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col space-y-3 p-4 pt-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-2">
            {activeTab === 'guesses' && (
              <>
                {guesses.length === 0 && isGuessingPhase && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No guesses yet. Be the first to guess!
                  </div>
                )}
                {guesses.map((guess, index) => (
                  <div key={index} className={`p-2 rounded-lg text-sm ${
                    guess.isCorrect 
                      ? 'bg-game-accent/10 border border-game-accent/20' 
                      : 'bg-secondary/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-muted-foreground">
                        {guess.playerName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(guess.timestamp)}
                      </span>
                    </div>
                    <div className={`mt-1 ${guess.isCorrect ? 'text-game-accent font-semibold' : ''}`}>
                      {guess.guess}
                      {guess.isCorrect && (
                        <Badge className="ml-2 bg-game-accent hover:bg-game-accent text-xs">
                          Correct!
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {activeTab === 'chat' && (
              <>
                {messages.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No messages yet. Say hello!
                  </div>
                )}
                {messages.map((message, index) => (
                  <div key={index} className={`p-2 rounded-lg text-sm ${
                    message.type === 'system' 
                      ? 'bg-muted/50 italic' 
                      : message.playerId === currentPlayerId
                        ? 'bg-primary/10 border border-primary/20'
                        : 'bg-secondary/50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-xs text-muted-foreground">
                        {message.playerName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                    <div className="mt-1">{message.message}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={activeTab === 'guesses' ? "Enter your guess..." : "Type a message..."}
            onKeyPress={handleKeyPress}
            disabled={!isGuessingPhase && activeTab === 'guesses'}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || (!isGuessingPhase && activeTab === 'guesses')}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!isGuessingPhase && activeTab === 'guesses' && (
          <p className="text-xs text-muted-foreground text-center">
            Game not active - guessing disabled
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatSystem;