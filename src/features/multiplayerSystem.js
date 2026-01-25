// Real-time Multiplayer Foundation - Revolutionary networked battles
export class MultiplayerSystem {
  constructor() {
    this.isHost = false;
    this.isConnected = false;
    this.roomId = null;
    this.playerId = null;
    this.opponents = new Map();
    this.gameState = null;
    this.messageQueue = [];
    
    // WebRTC for peer-to-peer connections (more efficient than WebSocket for real-time)
    this.peerConnection = null;
    this.dataChannel = null;
    
    // For now, simulate with localStorage for demo purposes
    this.useLocalSimulation = true;
  }

  // Create a new multiplayer room
  async createRoom(playerName) {
    this.roomId = this.generateRoomId();
    this.playerId = this.generatePlayerId();
    this.isHost = true;
    
    if (this.useLocalSimulation) {
      this.simulateLocalRoom(playerName);
    } else {
      // Future: Connect to actual signaling server
      await this.connectToSignalingServer();
    }
    
    this.isConnected = true;
    return this.roomId;
  }

  // Join an existing room
  async joinRoom(roomId, playerName) {
    this.roomId = roomId;
    this.playerId = this.generatePlayerId();
    this.isHost = false;
    
    if (this.useLocalSimulation) {
      return this.simulateJoinRoom(roomId, playerName);
    } else {
      // Future: Connect via WebRTC
      return await this.connectToRoom(roomId, playerName);
    }
  }

  simulateLocalRoom(playerName) {
    // Store room data in localStorage for demo
    const roomData = {
      id: this.roomId,
      host: {
        id: this.playerId,
        name: playerName,
        ready: false
      },
      players: [],
      gameState: 'waiting',
      createdAt: Date.now()
    };
    
    localStorage.setItem(`mp_room_${this.roomId}`, JSON.stringify(roomData));
    
    // Simulate finding a player after 3 seconds
    setTimeout(() => {
      this.simulatePlayerJoin();
    }, 3000);
  }

  simulateJoinRoom(roomId, playerName) {
    const roomData = JSON.parse(localStorage.getItem(`mp_room_${roomId}`));
    if (!roomData) {
      throw new Error('Room not found');
    }
    
    roomData.players.push({
      id: this.playerId,
      name: playerName,
      ready: false
    });
    
    localStorage.setItem(`mp_room_${roomId}`, JSON.stringify(roomData));
    this.isConnected = true;
    return true;
  }

  simulatePlayerJoin() {
    if (!this.isHost) return;
    
    const roomData = JSON.parse(localStorage.getItem(`mp_room_${this.roomId}`));
    roomData.players.push({
      id: 'ai_opponent_001',
      name: 'AI Challenger',
      ready: true
    });
    
    localStorage.setItem(`mp_room_${this.roomId}`, JSON.stringify(roomData));
    
    // Emit event for UI
    this.emit('player-joined', {
      playerId: 'ai_opponent_001',
      playerName: 'AI Challenger'
    });
  }

  // Send game action to opponents
  sendAction(action) {
    const message = {
      type: 'game_action',
      playerId: this.playerId,
      action: action,
      timestamp: Date.now()
    };
    
    if (this.useLocalSimulation) {
      this.simulateReceiveAction(message);
    } else {
      this.sendMessage(message);
    }
  }

  simulateReceiveAction(message) {
    // Simulate network delay
    setTimeout(() => {
      this.handleIncomingMessage(message);
    }, Math.random() * 100 + 50);
  }

  handleIncomingMessage(message) {
    switch (message.type) {
      case 'game_action':
        this.handleGameAction(message.action);
        break;
      case 'player_ready':
        this.handlePlayerReady(message.playerId);
        break;
      case 'sync_state':
        this.handleStateSync(message.gameState);
        break;
    }
  }

  handleGameAction(action) {
    // Apply opponent's action to local game state
    this.emit('opponent-action', action);
  }

  // Get current room status
  getRoomStatus() {
    if (!this.roomId) return null;
    
    if (this.useLocalSimulation) {
      const roomData = JSON.parse(localStorage.getItem(`mp_room_${this.roomId}`));
      return roomData;
    }
    
    return {
      id: this.roomId,
      playerCount: this.opponents.size + 1,
      isHost: this.isHost,
      connected: this.isConnected
    };
  }

  // Start multiplayer battle
  startMultiplayerBattle(localBots) {
    if (!this.isConnected) {
      throw new Error('Not connected to multiplayer session');
    }
    
    const battleState = {
      type: 'battle_start',
      players: {
        [this.playerId]: {
          bots: localBots,
          ready: true
        }
      },
      terrain: this.generateMultiplayerTerrain(),
      weather: this.getRandomWeather()
    };
    
    this.sendAction({
      type: 'battle_init',
      battleState: battleState
    });
    
    return battleState;
  }

  generateMultiplayerTerrain() {
    // Generate balanced terrain for fair PvP
    const terrain = {};
    const rows = 10; // Larger grid for multiplayer
    const cols = 8;
    
    for (let x = 1; x <= rows; x++) {
      for (let y = 1; y <= cols; y++) {
        let terrainType = 'normal';
        
        // Create symmetric terrain for fairness
        const centerX = Math.floor(rows / 2);
        if (Math.abs(x - centerX) > 2) {
          if (Math.random() < 0.3) {
            terrainType = ['forest', 'mountain', 'water'][Math.floor(Math.random() * 3)];
          }
        }
        
        terrain[`${x},${y}`] = {
          type: terrainType,
          x, y
        };
      }
    }
    
    return terrain;
  }

  getRandomWeather() {
    return ['clear', 'rain', 'snow'][Math.floor(Math.random() * 3)];
  }

  generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  generatePlayerId() {
    return 'player_' + Math.random().toString(36).substring(2, 10);
  }

  // Event system for UI updates
  emit(event, data) {
    document.dispatchEvent(new CustomEvent(`multiplayer:${event}`, { detail: data }));
  }

  // Disconnect from multiplayer
  disconnect() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    if (this.peerConnection) {
      this.peerConnection.close();
    }
    
    this.isConnected = false;
    this.roomId = null;
    this.playerId = null;
    this.opponents.clear();
  }

  // UI Helper: Render multiplayer lobby
  renderMultiplayerLobby(container) {
    container.innerHTML = '';
    container.style.background = '#1a202c';
    container.style.color = 'white';
    container.style.padding = '20px';
    container.style.borderRadius = '8px';
    
    const title = document.createElement('h2');
    title.textContent = 'Multiplayer Lobby';
    title.style.marginBottom = '20px';
    container.appendChild(title);
    
    if (!this.isConnected) {
      this.renderLobbySetup(container);
    } else {
      this.renderConnectedLobby(container);
    }
  }

  renderLobbySetup(container) {
    const setupDiv = document.createElement('div');
    
    // Create room section
    const createSection = document.createElement('div');
    createSection.style.marginBottom = '20px';
    createSection.style.padding = '15px';
    createSection.style.background = '#2d3748';
    createSection.style.borderRadius = '5px';
    
    const createTitle = document.createElement('h3');
    createTitle.textContent = 'Create Room';
    createSection.appendChild(createTitle);
    
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = 'Your name';
    nameInput.style.padding = '8px';
    nameInput.style.margin = '10px 10px 10px 0';
    nameInput.style.borderRadius = '4px';
    nameInput.style.border = 'none';
    createSection.appendChild(nameInput);
    
    const createBtn = document.createElement('button');
    createBtn.textContent = 'Create Room';
    createBtn.style.padding = '8px 15px';
    createBtn.style.background = '#38a169';
    createBtn.style.color = 'white';
    createBtn.style.border = 'none';
    createBtn.style.borderRadius = '4px';
    createBtn.style.cursor = 'pointer';
    
    createBtn.onclick = async () => {
      const name = nameInput.value.trim() || 'Player';
      try {
        const roomId = await this.createRoom(name);
        createBtn.textContent = `Room Created: ${roomId}`;
        createBtn.disabled = true;
        this.renderConnectedLobby(container);
      } catch (error) {
        alert('Failed to create room: ' + error.message);
      }
    };
    
    createSection.appendChild(createBtn);
    setupDiv.appendChild(createSection);
    
    // Join room section
    const joinSection = document.createElement('div');
    joinSection.style.padding = '15px';
    joinSection.style.background = '#2d3748';
    joinSection.style.borderRadius = '5px';
    
    const joinTitle = document.createElement('h3');
    joinTitle.textContent = 'Join Room';
    joinSection.appendChild(joinTitle);
    
    const roomInput = document.createElement('input');
    roomInput.type = 'text';
    roomInput.placeholder = 'Room ID';
    roomInput.style.padding = '8px';
    roomInput.style.margin = '10px 10px 10px 0';
    roomInput.style.borderRadius = '4px';
    roomInput.style.border = 'none';
    joinSection.appendChild(roomInput);
    
    const joinNameInput = document.createElement('input');
    joinNameInput.type = 'text';
    joinNameInput.placeholder = 'Your name';
    joinNameInput.style.padding = '8px';
    joinNameInput.style.margin = '10px 10px 10px 0';
    joinNameInput.style.borderRadius = '4px';
    joinNameInput.style.border = 'none';
    joinSection.appendChild(joinNameInput);
    
    const joinBtn = document.createElement('button');
    joinBtn.textContent = 'Join Room';
    joinBtn.style.padding = '8px 15px';
    joinBtn.style.background = '#4299e1';
    joinBtn.style.color = 'white';
    joinBtn.style.border = 'none';
    joinBtn.style.borderRadius = '4px';
    joinBtn.style.cursor = 'pointer';
    
    joinBtn.onclick = async () => {
      const roomId = roomInput.value.trim().toUpperCase();
      const name = joinNameInput.value.trim() || 'Player';
      if (!roomId) {
        alert('Please enter a room ID');
        return;
      }
      
      try {
        await this.joinRoom(roomId, name);
        this.renderConnectedLobby(container);
      } catch (error) {
        alert('Failed to join room: ' + error.message);
      }
    };
    
    joinSection.appendChild(joinBtn);
    setupDiv.appendChild(joinSection);
    
    container.appendChild(setupDiv);
  }

  renderConnectedLobby(container) {
    container.innerHTML = '';
    
    const connectedDiv = document.createElement('div');
    
    const statusDiv = document.createElement('div');
    statusDiv.style.marginBottom = '20px';
    statusDiv.style.padding = '15px';
    statusDiv.style.background = '#2d3748';
    statusDiv.style.borderRadius = '5px';
    
    statusDiv.innerHTML = `
      <h3>Room: ${this.roomId}</h3>
      <p>Role: ${this.isHost ? 'Host' : 'Player'}</p>
      <p>Status: Connected</p>
    `;
    
    connectedDiv.appendChild(statusDiv);
    
    // Players list
    const playersDiv = document.createElement('div');
    playersDiv.style.marginBottom = '20px';
    
    const playersTitle = document.createElement('h4');
    playersTitle.textContent = 'Players';
    playersDiv.appendChild(playersTitle);
    
    const playersList = document.createElement('div');
    playersList.style.background = '#2d3748';
    playersList.style.padding = '10px';
    playersList.style.borderRadius = '5px';
    
    // Add current player
    const selfDiv = document.createElement('div');
    selfDiv.textContent = `You (${this.playerId}) - Ready`;
    selfDiv.style.color = '#38a169';
    playersList.appendChild(selfDiv);
    
    // Add other players (simulated)
    const roomStatus = this.getRoomStatus();
    if (roomStatus && roomStatus.players) {
      roomStatus.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `${player.name} (${player.id}) - ${player.ready ? 'Ready' : 'Not Ready'}`;
        playerDiv.style.color = player.ready ? '#38a169' : '#e53e3e';
        playersList.appendChild(playerDiv);
      });
    }
    
    playersDiv.appendChild(playersList);
    connectedDiv.appendChild(playersDiv);
    
    // Start battle button (only for host)
    if (this.isHost) {
      const startBtn = document.createElement('button');
      startBtn.textContent = 'Start Multiplayer Battle';
      startBtn.style.padding = '12px 20px';
      startBtn.style.background = '#805ad5';
      startBtn.style.color = 'white';
      startBtn.style.border = 'none';
      startBtn.style.borderRadius = '5px';
      startBtn.style.cursor = 'pointer';
      startBtn.style.width = '100%';
      startBtn.style.marginBottom = '10px';
      
      startBtn.onclick = () => {
        this.emit('start-multiplayer-battle', { roomId: this.roomId });
      };
      
      connectedDiv.appendChild(startBtn);
    }
    
    // Disconnect button
    const disconnectBtn = document.createElement('button');
    disconnectBtn.textContent = 'Disconnect';
    disconnectBtn.style.padding = '8px 15px';
    disconnectBtn.style.background = '#e53e3e';
    disconnectBtn.style.color = 'white';
    disconnectBtn.style.border = 'none';
    disconnectBtn.style.borderRadius = '5px';
    disconnectBtn.style.cursor = 'pointer';
    disconnectBtn.style.width = '100%';
    
    disconnectBtn.onclick = () => {
      this.disconnect();
      this.renderMultiplayerLobby(container);
    };
    
    connectedDiv.appendChild(disconnectBtn);
    container.appendChild(connectedDiv);
  }
}