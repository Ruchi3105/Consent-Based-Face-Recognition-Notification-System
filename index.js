// Required Packages
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
// const faceapi = require('face-api.js');
// const canvas = require('canvas');
const axios = require('axios');
const fs = require('fs');
dotenv.config();

// Load face-api models
// const { Canvas, Image, ImageData } = canvas;
// faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// App Initialization
const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(cookieParser());

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
}).then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;
const FACEPP_API_KEY = process.env.FACEPP_API_KEY;
const FACEPP_API_SECRET = process.env.FACEPP_API_SECRET;

// Schemas
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true },
  profilePic: { type: String, required: true },
  uploads: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Upload' }],
  allRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Consent' }]
});

const UploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  img: { type: String, required: true },
  description: { type: String, required: true },
  finalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
});

const ConsentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  img: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approve', 'reject'], default: 'pending' }
});

const User = mongoose.model('User', UserSchema);
const Upload = mongoose.model('Upload', UploadSchema);
const Consent = mongoose.model('Consent', ConsentSchema);

// Multer Storage for Profile Pictures
const profileStorage = multer.diskStorage({
  destination: './public/profilePics/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const uploadProfilePic = multer({ storage: profileStorage });

// File Upload Setup
const storage = multer.diskStorage({
  destination: './public/uploads/',
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware for Authentication
const authenticateJWT = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.redirect('/login');
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.redirect('/login');
    req.user = user;
    next();
  });
};

const FormData = require('form-data');

async function detectFaces(imagePath) {
  const formData = new FormData();
  formData.append('api_key', FACEPP_API_KEY);
  formData.append('api_secret', FACEPP_API_SECRET);
  formData.append('image_file', fs.createReadStream(imagePath));

  try {
    const response = await axios.post(
      'https://api-us.faceplusplus.com/facepp/v3/detect',
      formData,
      { headers: formData.getHeaders() } // ✅ Fix: Proper headers
    );

    return response.data.faces.map(face => face.face_token);
  } catch (error) {
    console.error('Error detecting faces:', error.response?.data || error);
    return [];
  }
}


async function matchFaces(faceTokens, users) {
  let matchedUsers = [];

  for (const user of users) {
    const formData = new FormData();
    formData.append('api_key', FACEPP_API_KEY);
    formData.append('api_secret', FACEPP_API_SECRET);
    formData.append('image_url', user.profilePic);

    try {
      const response = await axios.post(
        'https://api-us.faceplusplus.com/facepp/v3/detect',
        formData,
        { headers: formData.getHeaders() } // ✅ Fix: Proper headers
      );

      if (response.data.faces.length > 0) {
        const userFaceToken = response.data.faces[0].face_token;

        for (const detectedFaceToken of faceTokens) {
          const compareFormData = new FormData();
          compareFormData.append('api_key', FACEPP_API_KEY);
          compareFormData.append('api_secret', FACEPP_API_SECRET);
          compareFormData.append('face_token1', userFaceToken);
          compareFormData.append('face_token2', detectedFaceToken);

          const compareResponse = await axios.post(
            'https://api-us.faceplusplus.com/facepp/v3/compare',
            compareFormData,
            { headers: compareFormData.getHeaders() } // ✅ Fix: Proper headers
          );

          if (compareResponse.data.confidence > 80) { // Adjust confidence threshold if needed
            matchedUsers.push(user);
            break;
          }
        }
      }
    } catch (error) {
      console.error('Error matching faces:', error.response?.data || error);
    }
  }

  return matchedUsers;
}


/// Upload Image with Face Detection
app.post('/upload', authenticateJWT, upload.single('img'), async (req, res) => {
  const users = await User.find();
  const faceTokens = await detectFaces(`./public/uploads/${req.file.filename}`);
  const matchedUsers = await matchFaces(faceTokens, users);

  if (matchedUsers.length === 0) {
    const newUpload = new Upload({
      userId: req.user.id,
      img: `/uploads/${req.file.filename}`,
      description: req.body.description,
      finalStatus: 'approved'
    });
    await newUpload.save();
    await User.findByIdAndUpdate(req.user.id, { $push: { uploads: newUpload._id } });
    return res.redirect('/dashboard');
  }

  const newUpload = new Upload({
    userId: req.user.id,
    img: `/uploads/${req.file.filename}`,
    description: req.body.description,
    finalStatus: 'pending'
  });
  await newUpload.save();

  for (const matchedUser of matchedUsers) {
    const newConsent = new Consent({
      userId: matchedUser._id,
      uploadId: newUpload._id,
      img: newUpload.img,
      status: 'pending'
    });
    await newConsent.save();
  }
  res.redirect('/dashboard');
});

// Handle Consent
app.post('/consent/:consentId', authenticateJWT, async (req, res) => {
  const { status } = req.body;
  await Consent.findByIdAndUpdate(req.params.consentId, { status });

  const upload = await Upload.findById(req.body.uploadId);
  const consents = await Consent.find({ uploadId: upload._id });

  if (consents.every(c => c.status === 'approve')) {
    await Upload.findByIdAndUpdate(upload._id, { finalStatus: 'approved' });
  }
  res.redirect('/dashboard');
});

// Routes
app.get('/', (req, res) => res.render('index'));
app.get('/register', (req, res) => res.render('register'));
app.get('/login', (req, res) => res.render('login'));
app.get('/dashboard', authenticateJWT, async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate('uploads')
    .populate('allRequests');
  res.render('dashboard', { user });
});

// Register Route (Now Supports Profile Picture Upload)
app.post('/register', uploadProfilePic.single('profilePic'), async (req, res) => {
  const { email, username, password } = req.body;
  const profilePicPath = req.file.filename; // Save only the filename

  const user = new User({ email, username, password, profilePic: `/profilePics/${req.file.filename}` });
  await user.save();
  res.redirect('/login');
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.redirect('/login');
  const token = jwt.sign({ id: user._id }, JWT_SECRET);
  res.cookie('token', token).redirect('/dashboard');
});

// Logout
app.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/login');
});

// Start Server
app.listen(3000, () => console.log('Server running on port 3000'));
