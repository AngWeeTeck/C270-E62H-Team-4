const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.use('/api/badges', require('./routes/badges'));

app.listen(PORT, () => {
  console.log(`Badges server running on port ${PORT}`);
});