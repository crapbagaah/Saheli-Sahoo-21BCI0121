const express = require('express');
const Game = require('../models/Game');
const router = express.Router();

// Utility functions
const isValidMove = (game, player, char, move) => {
    const charIndex = game.board.findIndex(piece => piece === char);
    if (charIndex === -1) return false; // Character not found on the board
    const row = Math.floor(charIndex / 5);
    const col = charIndex % 5;

    let targetRow = row;
    let targetCol = col;

    // Determine target position based on the move and character type
    switch (char[0]) { // Assuming P for Pawn, H1 for Hero1, H2 for Hero2
        case 'P':
            switch (move) {
                case 'L': targetCol -= 1; break;
                case 'R': targetCol += 1; break;
                case 'F': targetRow -= 1; break;
                case 'B': targetRow += 1; break;
                default: return false;
            }
            break;
        case 'H':
            if (char[1] === '1') { // Hero1 - Straight 2 blocks
                switch (move) {
                    case 'L': targetCol -= 2; break;
                    case 'R': targetCol += 2; break;
                    case 'F': targetRow -= 2; break;
                    case 'B': targetRow += 2; break;
                    default: return false;
                }
            } else if (char[1] === '2') { // Hero2 - Diagonal 2 blocks
                switch (move) {
                    case 'FL': targetRow -= 2; targetCol -= 2; break;
                    case 'FR': targetRow -= 2; targetCol += 2; break;
                    case 'BL': targetRow += 2; targetCol -= 2; break;
                    case 'BR': targetRow += 2; targetCol += 2; break;
                    default: return false;
                }
            }
            break;
        default:
            return false;
    }

    // Check if the target position is out of bounds
    if (targetRow < 0 || targetRow > 4 || targetCol < 0 || targetCol > 4) return false;

    const moveIndex = targetRow * 5 + targetCol;

    // Check if the target position is occupied by the same player's character
    if (game.board[moveIndex] && game.board[moveIndex][0] === player) return false;

    return true;
};

const updateBoard = (game, player, char, move) => {
    const charIndex = game.board.findIndex(piece => piece === char);
    const row = Math.floor(charIndex / 5);
    const col = charIndex % 5;

    let targetRow = row;
    let targetCol = col;

    switch (char[0]) {
        case 'P':
            switch (move) {
                case 'L': targetCol -= 1; break;
                case 'R': targetCol += 1; break;
                case 'F': targetRow -= 1; break;
                case 'B': targetRow += 1; break;
            }
            break;
        case 'H':
            if (char[1] === '1') { // Hero1 - Straight 2 blocks
                switch (move) {
                    case 'L': targetCol -= 2; break;
                    case 'R': targetCol += 2; break;
                    case 'F': targetRow -= 2; break;
                    case 'B': targetRow += 2; break;
                }
            } else if (char[1] === '2') { // Hero2 - Diagonal 2 blocks
                switch (move) {
                    case 'FL': targetRow -= 2; targetCol -= 2; break;
                    case 'FR': targetRow -= 2; targetCol += 2; break;
                    case 'BL': targetRow += 2; targetCol -= 2; break;
                    case 'BR': targetRow += 2; targetCol += 2; break;
                }
            }
            break;
    }

    const moveIndex = targetRow * 5 + targetCol;

    // If the target position has an opponent's character, capture it
    if (game.board[moveIndex] && game.board[moveIndex][0] !== player) {
        const opponentPlayer = player === 'A' ? 'playerB' : 'playerA';
        game[opponentPlayer] = game[opponentPlayer].filter(c => c !== game.board[moveIndex]);
    }

    // Move the character to the new position
    game.board[charIndex] = null; // Clear the previous position
    game.board[moveIndex] = char; // Place the character at the new position
};

const checkWinner = (game) => {
    if (game.playerA.length === 0) return 'B'; // Player B wins
    if (game.playerB.length === 0) return 'A'; // Player A wins
    return null;
};

// Routes
router.post('/start', async (req, res) => {
    const { playerA, playerB } = req.body;

    const newGame = new Game({
        playerA: playerA,
        playerB: playerB,
        board: [...playerA, ...Array(15).fill(null), ...playerB],
        turn: 'A',
        history: [] // Initialize history array
    });

    try {
        const savedGame = await newGame.save();
        res.status(200).json(savedGame);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/move', async (req, res) => {
    const { gameId, player, char, move } = req.body;

    try {
        const game = await Game.findById(gameId);

        if (!game || game.winner) return res.status(400).json({ message: "Invalid game or game already finished." });
        if (game.turn !== player) return res.status(400).json({ message: "Not your turn!" });

        if (isValidMove(game, player, char, move)) {
            updateBoard(game, player, char, move);
            game.turn = game.turn === 'A' ? 'B' : 'A';
            game.history.push(`${player}-${char}: ${move}`);

            const winner = checkWinner(game);
            if (winner) {
                game.winner = winner;
            }

            const updatedGame = await game.save();
            res.status(200).json(updatedGame);
        } else {
            res.status(400).json({ message: "Invalid move." });
        }
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
