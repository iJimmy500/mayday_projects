import React from 'react';

export default function PlayersScreen({ 
  players, 
  addPlayer, 
  removePlayer, 
  shufflePlayers, 
  newPlayerName, 
  setNewPlayerName, 
  passMode, 
  setPassMode, 
  onBack, 
  onStartGame 
}) {
  return (
    <div className="hp-fade-in">
      <h1 className="hp-title">Players Roster</h1>
      <p className="hp-subtitle">Add 2 to 12 players</p>

      <form onSubmit={addPlayer} className="hp-player-form">
        <input 
          type="text" 
          maxLength={16}
          placeholder="Enter player name" 
          value={newPlayerName} 
          onChange={(e) => setNewPlayerName(e.target.value)} 
          className="hp-player-input"
        />
        <button type="submit" className="hp-player-add-btn" disabled={players.length >= 12}>Add</button>
      </form>

      <div className="hp-players-list">
        {players.length === 0 ? (
          <div className="hp-players-placeholder">
            No players added yet.<br />Add 2 to 12 players to start.
          </div>
        ) : (
          players.map((name, i) => (
            <div key={name} className="hp-player-badge">
              <span className="hp-badge-num">{i + 1}</span>
              <span className="hp-badge-name">{name}</span>
              <button onClick={() => removePlayer(name)} className="hp-badge-remove">&times;</button>
            </div>
          ))
        )}
      </div>

      <div className="hp-settings-group" style={{ marginTop: '0.75rem' }}>
        <div className="hp-settings-title">Potato Pass Mode</div>
        <div className="hp-segmented">
          <button className={`hp-segment ${passMode === 'order' ? 'active' : ''}`} onClick={() => setPassMode('order')}>Order Flow</button>
          <button className={`hp-segment ${passMode === 'random' ? 'active' : ''}`} onClick={() => setPassMode('random')}>Random Pass</button>
        </div>
      </div>

      <div className="hp-button-row" style={{ width: '100%', display: 'flex', gap: '12px', marginTop: '0.75rem' }}>
        <button className="hp-btn-massive" style={{ background: '#222', color: '#fff', flex: 1 }} onClick={onBack}>Back</button>
        <button className="hp-btn-massive" style={{ background: '#333', color: '#fff', flex: 1 }} onClick={shufflePlayers} disabled={players.length < 2}>Shuffle</button>
      </div>

      <button 
        className="hp-btn-massive hp-btn-success" 
        disabled={players.length < 2} 
        onClick={onStartGame}
        style={{ marginTop: '0.75rem' }}
      >
        Start Game Setup
      </button>
    </div>
  );
}
