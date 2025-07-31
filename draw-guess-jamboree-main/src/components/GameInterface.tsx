import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Users, Shuffle } from 'lucide-react';
import DrawingCanvas from './DrawingCanvas';
import { useToast } from '@/hooks/use-toast';

const WORDS = [
  'cat', 'dog', 'house', 'car', 'tree', 'flower', 'sun', 'moon', 'star', 'fish',
  'bird', 'apple', 'banana', 'chair', 'table', 'computer', 'phone', 'book', 'music', 'dance',
  'happy', 'sad', 'angry', 'excited', 'tired', 'hungry', 'cold', 'hot', 'fast', 'slow',
  'elephant', 'giraffe', 'pizza', 'sandwich', 'bicycle', 'airplane', 'mountain', 'ocean', 'rainbow', 'butterfly'
];

interface Player {
  name: string;
  score: number;
}

const GameInterface: React.FC = () => {
  const [gameState, setGameState] = useState<'setup' | 'drawing' | 'guessing' | 'results'>('setup');
  const [currentWord, setCurrentWord] = useState('');
  const [players, setPlayers] = useState<Player[]>([
    { name: 'Player 1', score: 0 },
    { name: 'Player 2', score: 0 }
  ]);
  const [currentDrawer, setCurrentDrawer] = useState(0);
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);
  const [round, setRound] = useState(1);
  const [gameHistory, setGameHistory] = useState<string[]>([]);
  const { toast } = useToast();

  const startNewRound = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    setGameState('drawing');
    setTimeLeft(60);
    setGuess('');
    setGameHistory([]);
  }, []);

  const checkGuess = useCallback(() => {
    if (guess.toLowerCase().trim() === currentWord.toLowerCase()) {
      // Correct guess!
      const newPlayers = [...players];
      const guesserIndex = currentDrawer === 0 ? 1 : 0;
      newPlayers[guesserIndex].score += 10;
      newPlayers[currentDrawer].score += 5; // Drawer gets points too
      setPlayers(newPlayers);
      
      toast({
        title: "Correct! 🎉",
        description: `The word was "${currentWord}"!`,
        variant: "default",
      });
      
      setGameState('results');
    } else {
      // Wrong guess
      setGameHistory(prev => [...prev, `${players[currentDrawer === 0 ? 1 : 0].name}: ${guess}`]);
      toast({
        title: "Not quite...",
        description: "Keep trying!",
        variant: "destructive",
      });
    }
    setGuess('');
  }, [guess, currentWord, players, currentDrawer, toast]);

  const nextRound = useCallback(() => {
    setCurrentDrawer(prev => (prev + 1) % players.length);
    setRound(prev => prev + 1);
    startNewRound();
  }, [players.length, startNewRound]);

  const skipWord = useCallback(() => {
    const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(randomWord);
    toast({
      title: "Word skipped!",
      description: `New word: ${randomWord}`,
    });
  }, [toast]);

  // Timer effect
  useEffect(() => {
    if (gameState === 'drawing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'drawing') {
      toast({
        title: "Time's up!",
        description: `The word was "${currentWord}"`,
        variant: "destructive",
      });
      setGameState('results');
    }
  }, [timeLeft, gameState, currentWord, toast]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && guess.trim()) {
      checkGuess();
    }
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
              Draw & Guess
            </CardTitle>
            <p className="text-muted-foreground">Ready to start playing?</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Users className="w-4 h-4" />
                Players
              </h3>
              {players.map((player, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-secondary rounded">
                  <span>{player.name}</span>
                  <Badge variant="secondary">Score: {player.score}</Badge>
                </div>
              ))}
            </div>
            <Button 
              onClick={startNewRound} 
              className="w-full bg-gradient-to-r from-game-primary to-game-secondary hover:opacity-90"
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Round {round}
            </Badge>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-game-warning" />
              <span className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {players.map((player, index) => (
              <Card key={index} className={`p-3 ${index === currentDrawer ? 'border-game-primary bg-game-primary/5' : ''}`}>
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4" />
                  <span className="font-semibold">{player.name}</span>
                  <Badge variant={index === currentDrawer ? "default" : "secondary"}>
                    {player.score}
                  </Badge>
                  {index === currentDrawer && <Badge variant="outline">Drawing</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Drawing Area */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {currentDrawer === 0 ? 'Player 1' : 'Player 2'} is drawing
                  </CardTitle>
                  {gameState === 'drawing' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={skipWord}
                    >
                      <Shuffle className="w-4 h-4 mr-2" />
                      Skip Word
                    </Button>
                  )}
                </div>
                {gameState === 'drawing' && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Word to draw:</p>
                    <p className="text-3xl font-bold text-game-primary">{currentWord}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <DrawingCanvas 
                  isDrawing={gameState === 'drawing'} 
                  onClearCanvas={() => {}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Guessing Area */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Guess the Word!</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gameState === 'drawing' && (
                  <div className="space-y-3">
                    <div className="flex space-x-2">
                      <Input
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        placeholder="Enter your guess..."
                        onKeyPress={handleKeyPress}
                        disabled={gameState !== 'drawing'}
                      />
                      <Button 
                        onClick={checkGuess}
                        disabled={!guess.trim() || gameState !== 'drawing'}
                        className="bg-game-accent hover:bg-game-accent/90"
                      >
                        Guess
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {players[currentDrawer === 0 ? 1 : 0].name}, what do you think it is?
                    </p>
                  </div>
                )}

                {gameState === 'results' && (
                  <div className="space-y-4 text-center">
                    <div className="p-4 bg-game-accent/10 rounded-lg">
                      <p className="text-lg font-semibold text-game-accent">Round Complete!</p>
                      <p className="text-sm text-muted-foreground">The word was: <strong>{currentWord}</strong></p>
                    </div>
                    <Button onClick={nextRound} className="w-full">
                      Next Round
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setGameState('setup')} 
                      className="w-full"
                    >
                      End Game
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Guess History */}
            {gameHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Previous Guesses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {gameHistory.map((entry, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {entry}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInterface;