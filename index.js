// index.js

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors');
const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists!
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage: storage });

const BeatModel = require('./Beat');
const authRoutes = require('./authRoutes')(upload); // Now upload is initialized
const Transaction = require('./Transaction');

const app = express()
const port = 3000

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/auth', authRoutes);

mongoose.connect('mongodb://127.0.0.1/beatlib', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('DB is connected'))
.catch(err => console.log(err));

app.get('/', (req, res) => {
  res.send('Welcome to the Beats API');
});


// [GET ALL BEATS]
app.get('/beats', (req, res) => {
  BeatModel.find()
    .then(beats => res.json(beats))
    .catch(err => res.json(err))
});

// [GET SINGLE BEAT]
app.get('/beats/:id', (req, res) => {
  const id = req.params.id;
  BeatModel.findById(id)
    .then(beat => res.json(beat))
    .catch(err => res.json(err))
});

// [CREATE BEAT] with file upload
app.post('/beats', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverArt', maxCount: 1 }]), (req, res) => {
  const { audio, coverArt } = req.files;
  const { name, artist, genre, dateReleased } = req.body;
  const beatData = {
    name,
    artist,
    genre,
    dateReleased: new Date(dateReleased),
    audioPath: audio[0].path,
    coverArtPath: coverArt[0].path
  };
  
  BeatModel.create(beatData)
    .then(beat => res.json(beat))
    .catch(err => res.json(err));
});

// [UPDATE BEAT]
app.put('/beats/:id', upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'coverArt', maxCount: 1 }]), (req, res) => {
  console.log(req.body);
  const id = req.params.id;
  const { name, artist, genre, dateReleased } = req.body;

  console.log('Received body:', req.body);
  console.log('Received files:', req.files);

  // Start with fields that are guaranteed to be part of the form data
  let updateData = {
    name,
    artist,
    genre,
    dateReleased: new Date(dateReleased)
  };

  // Conditionally add file paths if new files are uploaded
  if (req.files.audio && req.files.audio.length > 0) {
    updateData.audioPath = req.files.audio[0].path;
  }
  if (req.files.coverArt && req.files.coverArt.length > 0) {
    updateData.coverArtPath = req.files.coverArt[0].path;
  }

  BeatModel.findByIdAndUpdate(id, { $set: updateData }, { new: true })
  .then(beat => {
    console.log('Updated Beat:', beat);
    res.json(beat);
  })
  .catch(err => {
    console.error('Error updating beat:', err);
    res.status(500).json({ message: 'Error updating beat', error: err });
  });
});



// [DELETE BEAT]
app.delete('/beats/:id', (req, res) => {
  const id = req.params.id;
  BeatModel.findByIdAndDelete(id)
    .then(result => res.json(result))
    .catch(err => res.json(err))
});


// [POST] Create a transaction
app.post('/transactions', (req, res) => {
  console.log("Creating transaction with data:", req.body); // Log incoming transaction data
  const transaction = new Transaction(req.body);
  transaction.save()
    .then(transaction => res.status(201).json(transaction))
    .catch(err => {
      console.error("Failed to create transaction:", err);
      res.status(400).json({ message: 'Failed to create transaction', error: err });
    });
});

// [GET] Fetch all transactions
app.get('/transactions', (req, res) => {
  console.log("Fetching all transactions"); // Log action
  Transaction.find()
    .then(transactions => res.json(transactions))
    .catch(err => {
      console.error("Failed to get transactions:", err);
      res.status(500).json({ message: 'Failed to get transactions', error: err });
    });
});


app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});
