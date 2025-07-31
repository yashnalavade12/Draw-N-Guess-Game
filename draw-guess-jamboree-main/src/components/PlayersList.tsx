import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Crown, Eye, Pencil, Users } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  score: number;
  isConnected: boolean;
  role: 'drawer' | 'guesser' | 'spectator';
}

interface PlayersListProps {
  players: Player[];
  currentDrawer: string;
}

const PlayersList: React.FC<PlayersListProps> = ({ players, currentDrawer }) => {
  const getPlayerIcon = (role: string, isCurrentDrawer: boolean) => {
    if (isCurrentDrawer) return <Crown className="w-4 h-4 text-yellow-500" />;
    if (role === 'drawer') return <Pencil className="w-4 h-4 text-game-primary" />;
    if (role === 'spectator') return <Eye className="w-4 h-4 text-muted-foreground" />;
    return <Users className="w-4 h-4 text-game-accent" />;
  };

  const getRoleBadge = (role: string, isCurrentDrawer: boolean) => {
    if (isCurrentDrawer) return <Badge className="bg-yellow-500 hover:bg-yellow-500">Drawing</Badge>;
    if (role === 'spectator') return <Badge variant="secondary">Spectating</Badge>;
    return <Badge variant="outline">Guessing</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Players ({players.filter(p => p.isConnected).length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players
            .filter(p => p.isConnected)
            .sort((a, b) => b.score - a.score)
            .map((player, index) => {
              const isCurrentDrawer = player.id === currentDrawer;
              return (
                <div 
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    isCurrentDrawer 
                      ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800' 
                      : 'bg-secondary/30'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {player.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {getPlayerIcon(player.role, isCurrentDrawer)}
                      <span className={`font-medium ${isCurrentDrawer ? 'text-yellow-700 dark:text-yellow-300' : ''}`}>
                        {player.name}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="font-mono">
                      {player.score}
                    </Badge>
                    {getRoleBadge(player.role, isCurrentDrawer)}
                  </div>
                </div>
              );
            })}
        </div>
        
        {players.filter(p => p.isConnected).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Waiting for players to join...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayersList;