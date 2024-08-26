const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const gameRoutes = require('./routes/gameRoutes');
app.use('/api/game', gameRoutes);


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chess_game', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
