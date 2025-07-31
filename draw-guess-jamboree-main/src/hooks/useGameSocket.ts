import { useState, useEffect, useCallback } from 'react';

// Simulates WebSocket functionality for multiplayer game
// In production, this would connect to a real WebSocket server

interface GameState {
  roomId: string;
  players: Array<{
    id: string;
    name: string;
    score: number;
    isConnected: boolean;
    role: 'drawer' | 'guesser' | 'spectator';
  }>;
  currentWord: string;
  currentDrawer: string;
  timeLeft: number;
  round: number;
  gameStatus: 'waiting' | 'playing' | 'finished';
  drawingData: Array<{
    type: 'stroke' | 'clear';
    data: any;
    timestamp: number;
  }>;
  guesses: Array<{
    playerId: string;
    playerName: string;
    guess: string;
    timestamp: number;
    isCorrect?: boolean;
  }>;
  chatMessages: Array<{
    playerId: string;
    playerName: string;
    message: string;
    timestamp: number;
    type: 'chat' | 'system';
  }>;
}

interface GameActions {
  joinRoom: (roomId: string, playerName: string) => void;
  createRoom: (playerName: string) => void;
  leaveRoom: () => void;
  startGame: () => void;
  sendDrawingData: (drawingData: any) => void;
  sendGuess: (guess: string) => void;
  sendChatMessage: (message: string) => void;
  skipWord: () => void;
  nextRound: () => void;
}

// Simulated server state (in production, this would be on the server)
const gameRooms = new Map<string, GameState>();
const connections = new Map<string, string>(); // playerId -> roomId

export const useGameSocket = (playerId: string): [GameState | null, GameActions] => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    if (!gameState?.roomId) return;

    const interval = setInterval(() => {
      const room = gameRooms.get(gameState.roomId);
      if (room && room !== gameState) {
        setGameState({ ...room });
      }
    }, 100); // Check for updates every 100ms

    return () => clearInterval(interval);
  }, [gameState]);

  const joinRoom = useCallback((roomId: string, playerName: string) => {
    let room = gameRooms.get(roomId);
    
    if (!room) {
      // Room doesn't exist
      return;
    }

    // Add player to room
    const existingPlayer = room.players.find(p => p.id === playerId);
    if (!existingPlayer) {
      const newPlayer = {
        id: playerId,
        name: playerName,
        score: 0,
        isConnected: true,
        role: room.players.length === 0 ? 'drawer' : room.players.length === 1 ? 'guesser' : 'spectator'
      } as const;

      room.players.push(newPlayer);
      room.chatMessages.push({
        playerId: 'system',
        playerName: 'System',
        message: `${playerName} joined the game`,
        timestamp: Date.now(),
        type: 'system'
      });
    } else {
      existingPlayer.isConnected = true;
    }

    connections.set(playerId, roomId);
    gameRooms.set(roomId, room);
    setGameState({ ...room });
    setIsConnected(true);
  }, [playerId]);

  const createRoom = useCallback((playerName: string) => {
    const roomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const newRoom: GameState = {
      roomId,
      players: [{
        id: playerId,
        name: playerName,
        score: 0,
        isConnected: true,
        role: 'drawer'
      }],
      currentWord: '',
      currentDrawer: playerId,
      timeLeft: 0,
      round: 1,
      gameStatus: 'waiting',
      drawingData: [],
      guesses: [],
      chatMessages: [{
        playerId: 'system',
        playerName: 'System',
        message: `Room ${roomId} created`,
        timestamp: Date.now(),
        type: 'system'
      }]
    };

    gameRooms.set(roomId, newRoom);
    connections.set(playerId, roomId);
    setGameState(newRoom);
    setIsConnected(true);
  }, [playerId]);

  const leaveRoom = useCallback(() => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (room) {
      const playerIndex = room.players.findIndex(p => p.id === playerId);
      if (playerIndex !== -1) {
        room.players[playerIndex].isConnected = false;
        room.chatMessages.push({
          playerId: 'system',
          playerName: 'System',
          message: `${room.players[playerIndex].name} left the game`,
          timestamp: Date.now(),
          type: 'system'
        });
        gameRooms.set(roomId, room);
      }
    }

    connections.delete(playerId);
    setGameState(null);
    setIsConnected(false);
  }, [playerId]);

  const startGame = useCallback(() => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room || room.players.filter(p => p.isConnected).length < 2) return;

    const words = [
      'cat', 'dog', 'house', 'car', 'tree', 'flower', 'sun', 'moon', 'star', 'fish',
      'bird', 'apple', 'banana', 'chair', 'table', 'computer', 'phone', 'book', 'music', 'dance'
    ];
    
    room.currentWord = words[Math.floor(Math.random() * words.length)];
    room.gameStatus = 'playing';
    room.timeLeft = 60;
    room.drawingData = [];
    room.guesses = [];

    gameRooms.set(roomId, room);
    setGameState({ ...room });

    // Start timer
    const timer = setInterval(() => {
      const currentRoom = gameRooms.get(roomId);
      if (currentRoom && currentRoom.timeLeft > 0 && currentRoom.gameStatus === 'playing') {
        currentRoom.timeLeft--;
        gameRooms.set(roomId, currentRoom);
      } else {
        clearInterval(timer);
      }
    }, 1000);
  }, [playerId]);

  const sendDrawingData = useCallback((drawingData: any) => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room || room.currentDrawer !== playerId) return;

    room.drawingData.push({
      type: 'stroke',
      data: drawingData,
      timestamp: Date.now()
    });

    gameRooms.set(roomId, room);
  }, [playerId]);

  const sendGuess = useCallback((guess: string) => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room || room.currentDrawer === playerId) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    const isCorrect = guess.toLowerCase().trim() === room.currentWord.toLowerCase();
    
    room.guesses.push({
      playerId,
      playerName: player.name,
      guess,
      timestamp: Date.now(),
      isCorrect
    });

    if (isCorrect) {
      // Award points
      player.score += 10;
      const drawer = room.players.find(p => p.id === room.currentDrawer);
      if (drawer) drawer.score += 5;

      room.chatMessages.push({
        playerId: 'system',
        playerName: 'System',
        message: `${player.name} guessed correctly! The word was "${room.currentWord}"`,
        timestamp: Date.now(),
        type: 'system'
      });
    }

    gameRooms.set(roomId, room);
  }, [playerId]);

  const sendChatMessage = useCallback((message: string) => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room) return;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return;

    room.chatMessages.push({
      playerId,
      playerName: player.name,
      message,
      timestamp: Date.now(),
      type: 'chat'
    });

    gameRooms.set(roomId, room);
  }, [playerId]);

  const skipWord = useCallback(() => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room || room.currentDrawer !== playerId) return;

    const words = [
      'cat', 'dog', 'house', 'car', 'tree', 'flower', 'sun', 'moon', 'star', 'fish',
      'bird', 'apple', 'banana', 'chair', 'table', 'computer', 'phone', 'book', 'music', 'dance'
    ];
    
    room.currentWord = words[Math.floor(Math.random() * words.length)];
    room.drawingData = [];

    gameRooms.set(roomId, room);
  }, [playerId]);

  const nextRound = useCallback(() => {
    const roomId = connections.get(playerId);
    if (!roomId) return;

    const room = gameRooms.get(roomId);
    if (!room) return;

    // Switch roles
    const connectedPlayers = room.players.filter(p => p.isConnected && p.role !== 'spectator');
    const currentDrawerIndex = connectedPlayers.findIndex(p => p.id === room.currentDrawer);
    const nextDrawerIndex = (currentDrawerIndex + 1) % connectedPlayers.length;
    
    room.currentDrawer = connectedPlayers[nextDrawerIndex].id;
    room.round++;
    
    // Reset roles
    room.players.forEach(player => {
      if (player.isConnected) {
        if (player.id === room.currentDrawer) {
          player.role = 'drawer';
        } else if (player.role !== 'spectator') {
          player.role = 'guesser';
        }
      }
    });

    const words = [
      'cat', 'dog', 'house', 'car', 'tree', 'flower', 'sun', 'moon', 'star', 'fish',
      'bird', 'apple', 'banana', 'chair', 'table', 'computer', 'phone', 'book', 'music', 'dance'
    ];
    
    room.currentWord = words[Math.floor(Math.random() * words.length)];
    room.timeLeft = 60;
    room.drawingData = [];
    room.guesses = [];
    room.gameStatus = 'playing';

    gameRooms.set(roomId, room);
  }, [playerId]);

  const actions: GameActions = {
    joinRoom,
    createRoom,
    leaveRoom,
    startGame,
    sendDrawingData,
    sendGuess,
    sendChatMessage,
    skipWord,
    nextRound
  };

  return [gameState, actions];
};