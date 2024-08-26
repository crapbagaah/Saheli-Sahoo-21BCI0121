import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Game.css';

const Game = () => {
  const [game, setGame] = useState(null);
  const [player, setPlayer] = useState('A');
  const [char, setChar] = useState('');
  const [move, setMove] = useState('');

  useEffect(() => {
    // Initialize the game with player characters
    const initGame = async () => {
      const response = await axios.post('http://localhost:5000/api/game/start', {
        playerA: ['A-P1', 'A-H1', 'A-H2', 'A-P2', 'A-P3'],
        playerB: ['B-P1', 'B-H1', 'B-H2', 'B-P2', 'B-P3']
      });
      setGame(response.data);
    };
    initGame();
  }, []);

  const handleMove = async () => {
    if (game && char && move) {
      try {
        const response = await axios.post('http://localhost:5000/api/game/move', {
          gameId: game._id,
          player,
          char,
          move
        });
        setGame(response.data);
        setChar('');
        setMove('');
      } catch (error) {
        alert('Invalid move. Please try again.');
      }
    }
  };

  return (
    <div className="game-container">
      <h1>Advanced Chess-like Game</h1>
      {game && (
        <>
          <div className="status-bar">
            {game.winner ? <h2>{`Player ${game.winner} wins!`}</h2> : <h2>{`Current Turn: Player ${game.turn}`}</h2>}
          </div>
          <div className="board">
            {game.board.map((square, index) => (
              <div key={index} className={`square ${square ? 'occupied' : ''}`}>
                {square || index + 1}
              </div>
            ))}
          </div>
          <div className="controls">
            <input type="text" value={char} onChange={e => setChar(e.target.value)} placeholder="Character ID (e.g., A-P1)" />
            <input type="text" value={move} onChange={e => setMove(e.target.value)} placeholder="Move Position (1-25)" />
            <button onClick={handleMove}>Make Move</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
