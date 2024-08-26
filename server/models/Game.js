const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  playerA: {
    type: Array,
    required: true,
  },
  playerB: {
    type: Array,
    required: true,
  },
  turn: {
    type: String,
    required: true,
    default: 'A'
  },
  board: {
    type: Array,
    required: true,
    default: Array(25).fill(null)
  },
  history: {
    type: Array,
    default: []
  },
  winner: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Game', gameSchema);
