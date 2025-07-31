import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, LogIn, Gamepad2 } from 'lucide-react';

interface GameLobbyProps {
  onJoinRoom: (roomId: string, playerName: string) => void;
  onCreateRoom: (playerName: string) => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onJoinRoom, onCreateRoom }) => {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [activeTab, setActiveTab] = useState<'join' | 'create'>('create');

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && roomId.trim()) {
      onJoinRoom(roomId.trim().toUpperCase(), playerName.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-game-primary to-game-secondary rounded-full flex items-center justify-center">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl bg-gradient-to-r from-game-primary to-game-secondary bg-clip-text text-transparent">
              Draw & Guess
            </CardTitle>
            <p className="text-muted-foreground mt-2">Multiplayer Drawing Game</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Player Name Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Name</label>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="text-center"
            />
          </div>

          {/* Tab Selection */}
          <div className="flex space-x-2 p-1 bg-secondary rounded-lg">
            <Button
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('create')}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Room
            </Button>
            <Button
              variant={activeTab === 'join' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setActiveTab('join')}
            >
              <LogIn className="w-4 h-4 mr-2" />
              Join Room
            </Button>
          </div>

          {/* Create Room */}
          {activeTab === 'create' && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-game-primary/5 rounded-lg border border-game-primary/20">
                <Users className="w-8 h-8 mx-auto mb-2 text-game-primary" />
                <h3 className="font-semibold text-game-primary">Create New Game</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Start a new room and invite friends to join
                </p>
              </div>
              
              <Button 
                onClick={handleCreateRoom}
                disabled={!playerName.trim()}
                className="w-full bg-gradient-to-r from-game-primary to-game-secondary hover:opacity-90"
                size="lg"
              >
                Create Room
              </Button>
            </div>
          )}

          {/* Join Room */}
          {activeTab === 'join' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Room Code</label>
                <Input
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                  placeholder="Enter room code..."
                  className="text-center tracking-wider"
                  maxLength={6}
                />
              </div>
              
              <div className="text-center p-4 bg-game-accent/5 rounded-lg border border-game-accent/20">
                <LogIn className="w-8 h-8 mx-auto mb-2 text-game-accent" />
                <h3 className="font-semibold text-game-accent">Join Existing Game</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter the room code shared by your friend
                </p>
              </div>
              
              <Button 
                onClick={handleJoinRoom}
                disabled={!playerName.trim() || !roomId.trim() || roomId.length !== 6}
                className="w-full bg-game-accent hover:bg-game-accent/90"
                size="lg"
              >
                Join Room
              </Button>
            </div>
          )}

          {/* Game Rules */}
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2">How to Play</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• One player draws, others guess</li>
              <li>• 60 seconds per round</li>
              <li>• Earn points for correct guesses</li>
              <li>• Take turns being the drawer</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameLobby;