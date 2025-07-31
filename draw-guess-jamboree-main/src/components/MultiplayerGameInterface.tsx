import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Share2, LogOut, Play, Shuffle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useGameSocket } from '@/hooks/useGameSocket';
import GameLobby from './GameLobby';
import DrawingCanvas from './DrawingCanvas';
import PlayersList from './PlayersList';
import ChatSystem from './ChatSystem';

const MultiplayerGameInterface: React.FC = () => {
  const [playerId] = useState(() => Math.random().toString(36).substr(2, 9));
  const [gameState, gameActions] = useGameSocket(playerId);
  const { toast } = useToast();

  const currentPlayer = gameState?.players.find(p => p.id === playerId);
  const isDrawer = gameState?.currentDrawer === playerId;
  const canGuess = gameState?.gameStatus === 'playing' && !isDrawer && currentPlayer?.role !== 'spectator';

  useEffect(() => {
    // Show toast notifications for game events
    if (gameState?.guesses) {
      const lastGuess = gameState.guesses[gameState.guesses.length - 1];
      if (lastGuess && lastGuess.isCorrect && lastGuess.playerId !== playerId) {
        toast({
          title: "Correct Guess! 🎉",
          description: `${lastGuess.playerName} guessed the word!`,
          variant: "default",
        });
      }
    }
  }, [gameState?.guesses, playerId, toast]);

  const handleShareRoom = () => {
    if (gameState?.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      toast({
        title: "Room code copied!",
        description: `Share code: ${gameState.roomId}`,
      });
    }
  };

  const handleGuess = (guess: string) => {
    gameActions.sendGuess(guess);
  };

  const handleChatMessage = (message: string) => {
    gameActions.sendChatMessage(message);
  };

  const handleDrawingData = (data: any) => {
    gameActions.sendDrawingData(data);
  };

  // Show lobby if not in a game
  if (!gameState) {
    return (
      <GameLobby
        onJoinRoom={gameActions.joinRoom}
        onCreateRoom={gameActions.createRoom}
      />
    );
  }

  // Waiting room
  if (gameState.gameStatus === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Room Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
                    Room {gameState.roomId}
                  </CardTitle>
                  <p className="text-muted-foreground">Waiting for players to join...</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleShareRoom}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Room
                  </Button>
                  <Button variant="outline" onClick={gameActions.leaveRoom}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Leave
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant="outline" className="text-lg px-4 py-2">
                    <Copy className="w-4 h-4 mr-2" />
                    {gameState.roomId}
                  </Badge>
                  <span className="text-muted-foreground">
                    {gameState.players.filter(p => p.isConnected).length} / 2+ players
                  </span>
                </div>
                <Button 
                  onClick={gameActions.startGame}
                  disabled={gameState.players.filter(p => p.isConnected).length < 2}
                  className="bg-gradient-to-r from-game-primary to-game-secondary hover:opacity-90"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Players List */}
          <PlayersList 
            players={gameState.players}
            currentDrawer={gameState.currentDrawer}
          />

          {/* Game Rules */}
          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">🎨 Drawing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use mouse to draw on the canvas</li>
                  <li>• Choose colors and brush sizes</li>
                  <li>• You have 60 seconds per round</li>
                  <li>• Draw the word shown to you</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎯 Guessing</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Type your guesses in the chat</li>
                  <li>• First correct guess gets 10 points</li>
                  <li>• Drawer gets 5 points for correct guesses</li>
                  <li>• Take turns being the drawer</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Game Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-lg px-4 py-2">
              Room {gameState.roomId}
            </Badge>
            <Badge variant="outline" className="text-lg px-4 py-2">
              Round {gameState.round}
            </Badge>
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-game-warning" />
              <span className={`text-2xl font-bold ${gameState.timeLeft <= 10 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
                {gameState.timeLeft}s
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isDrawer && (
              <Button variant="outline" size="sm" onClick={gameActions.skipWord}>
                <Shuffle className="w-4 h-4 mr-2" />
                Skip Word
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleShareRoom}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={gameActions.leaveRoom}>
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Drawing Area */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {isDrawer ? 'Your turn to draw!' : `${gameState.players.find(p => p.id === gameState.currentDrawer)?.name} is drawing`}
                  </CardTitle>
                  {gameState.timeLeft === 0 && (
                    <Button onClick={gameActions.nextRound} className="bg-game-accent hover:bg-game-accent/90">
                      Next Round
                    </Button>
                  )}
                </div>
                {isDrawer && gameState.currentWord && (
                  <div className="text-center p-4 bg-game-primary/5 rounded-lg border border-game-primary/20">
                    <p className="text-sm text-muted-foreground mb-2">Your word:</p>
                    <p className="text-3xl font-bold text-game-primary">{gameState.currentWord}</p>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <DrawingCanvas 
                  isDrawing={isDrawer && gameState.gameStatus === 'playing'} 
                  onClearCanvas={() => {}}
                  onDrawingData={handleDrawingData}
                  drawingData={gameState.drawingData}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-2 space-y-6">
            {/* Players List */}
            <PlayersList 
              players={gameState.players}
              currentDrawer={gameState.currentDrawer}
            />

            {/* Chat & Guessing */}
            <ChatSystem
              messages={gameState.chatMessages}
              guesses={gameState.guesses}
              onSendMessage={canGuess ? handleGuess : handleChatMessage}
              currentPlayerId={playerId}
              isGuessingPhase={canGuess}
            />
          </div>
        </div>

        {/* Game Over */}
        {gameState.timeLeft === 0 && gameState.gameStatus === 'playing' && (
          <Card className="border-game-warning">
            <CardContent className="text-center py-8">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-game-warning" />
              <h2 className="text-2xl font-bold mb-2">Round Complete!</h2>
              <p className="text-lg text-muted-foreground mb-4">
                The word was: <strong className="text-game-primary">{gameState.currentWord}</strong>
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={gameActions.nextRound} className="bg-game-accent hover:bg-game-accent/90">
                  Next Round
                </Button>
                <Button variant="outline" onClick={gameActions.leaveRoom}>
                  End Game
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MultiplayerGameInterface;