// users.js

const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    accountType: { type: String, enum: ['Beatmaker', 'Customer'], required: true },
    profileImagePath: { type: String, default: '' }
  });

const UserModel = mongoose.model ("users", UserSchema)

module.exports = UserModel;