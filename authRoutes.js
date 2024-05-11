const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UserModel = require('./users');
const multer = require('multer');
const path = require('path'); // Make sure to import path

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Ensure this directory exists or handle it dynamically
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

module.exports = (upload) => {
  const router = express.Router();

router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password, accountType } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = new UserModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully, please log in.' });
  } catch (error) {
    res.status(400).json({ message: 'Error creating user', error });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email' });
    }
    
    const passwordIsValid = await bcrypt.compare(password, user.password);
    if (!passwordIsValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    
    const token = jwt.sign({ id: user._id }, 'secret', { expiresIn: '1h' });
    res.json({ token });      
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.toString() });
  }
});

router.get('/profile', async (req, res) => {
  // console.log(req.headers.authorization); // Log the authorization header
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decoded = jwt.verify(token, 'secret');
    const user = await UserModel.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(400).json({ message: 'Error fetching user profile', error: error.toString() });
  }
});



router.put('/profile', upload.single('profilePicture'), async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decoded = jwt.verify(token, 'secret');
  const userId = decoded.id;
  const { firstName, lastName, email, password } = req.body;

  let updateData = {
    firstName,
    lastName,
    email,
    ...(password && { password: await bcrypt.hash(password, 10) })
  };

  if (req.file) {
    updateData.profileImagePath = req.file.path;
  }

  try {
    const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(400).json({ message: 'Error updating profile', error });
  }
});


return router;
};
// Correctly placed to export the router
