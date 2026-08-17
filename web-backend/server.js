require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const documentRoutes = require('./routes/documentRoutes');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api', documentRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/land_registry';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log(' Connected to MongoDB');
        app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
    })
    .catch((err) => console.error('MongoDB connection error:', err));