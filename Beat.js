// Beat.js

const mongoose = require('mongoose')

const BeatSchema = new mongoose.Schema({
    name: String,
    artist: String,
    genre: String,
    dateReleased: Date,
    audioPath: String,
    coverArtPath: String 
  });

const BeatModel = mongoose.model("beats", BeatSchema)

module.exports = BeatModel;
