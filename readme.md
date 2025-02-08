# Consent-Based Face Recognition Notification System

## 📌 Project Overview
This project aims to create a **consent-based notification system** for social media platforms. When a user attempts to upload an image, an **AI-powered face detection and recognition system** scans the image, identifies faces, and compares them with user profile pictures. If a match is found, the system sends a **consent request** to the identified users before allowing the upload. This ensures privacy and ethical sharing of photos involving multiple individuals.

---

## 🎯 Key Features
- **Face Detection & Recognition**: Uses the **Face++ API** to detect faces in uploaded images and match them with user profile pictures.
- **Consent Request Mechanism**: Notifies matched users and requests their approval before publishing an image.
- **Secure Authentication**: Implements **JWT-based authentication** for user access control.
- **User Dashboard**: Provides users with an interface to manage uploads, consent requests, and profile settings.
- **MongoDB Integration**: Stores user data, uploads, and consent requests securely.
- **Scalable & Secure**: Built using **Node.js, Express.js, and MongoDB** with proper middleware and security best practices.

---

## 🏗️ Tech Stack
| Technology | Purpose |
|------------|---------|
| **Node.js** | Backend server |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Face++ API** | Face detection & recognition |
| **JWT (JSON Web Tokens)** | Authentication & authorization |
| **Multer** | File upload handling |
| **EJS** | Template rendering |
| **Axios** | API requests |
| **Mongoose** | MongoDB ODM |
| **Dotenv** | Environment variable management |
| **Cookie-parser** | Managing authentication tokens |

---

## 🚀 How It Works
1. **User Registration & Login**: Users sign up by providing an email, username, password, and profile picture.
2. **Uploading an Image**:
   - The system detects faces in the image using **Face++**.
   - It then compares detected faces with user profile pictures in the database.
   - If a match is found, a **consent request** is sent to the identified users.
3. **Consent Handling**:
   - Users receive a notification and can **approve** or **reject** the request.
   - If all matched users approve, the image is published. Otherwise, it's rejected.
4. **User Dashboard**:
   - Users can view their uploads, pending approvals, and manage their consent requests.

---

## 📂 Project Structure
```
├── public/                  # Static files (images, styles, scripts)
│   ├── uploads/             # User-uploaded images
│   ├── profilePics/         # User profile pictures
├── views/                   # EJS template files
│   ├── index.ejs            # Homepage
│   ├── login.ejs            # Login page
│   ├── register.ejs         # Registration page
│   ├── dashboard.ejs        # User dashboard
├── models/                  # Mongoose models
│   ├── User.js              # User model
│   ├── Upload.js            # Upload model
│   ├── Consent.js           # Consent model
├── routes/                  # Route handlers
│   ├── auth.js              # Authentication routes
│   ├── upload.js            # Image upload & consent routes
├── index.js                 # Main server file
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
└── README.md                # Project documentation
```

---

## 🛠️ Installation & Setup
### 1️⃣ Prerequisites
Make sure you have **Node.js** and **MongoDB** installed on your machine.

### 2️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo-url.git
cd your-project-folder
```

### 3️⃣ Install Dependencies
```sh
npm install
```

### 4️⃣ Configure Environment Variables
Create a **.env** file in the project root and add:
```ini
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
FACEPP_API_KEY=your_faceplusplus_api_key
FACEPP_API_SECRET=your_faceplusplus_api_secret
```

### 5️⃣ Run the Server
```sh
npm start
```
Server will start at **http://localhost:3000**.

---

## 🛡️ Authentication & Authorization
- **JWT-based authentication** is implemented for secure user sessions.
- Users need to log in to upload images or approve consent requests.
- User sessions are managed using **cookies**.

---

## 📌 API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | User registration with profile picture |
| `/login` | POST | User login and JWT generation |
| `/upload` | POST | Uploads an image & initiates face recognition |
| `/consent/:consentId` | POST | Approves or rejects an image upload request |
| `/dashboard` | GET | User dashboard displaying uploads & consent requests |
| `/logout` | GET | Logs out the user |

---

## 🎭 Face Detection & Consent Workflow
1. **User uploads an image** → Faces detected using Face++ API.
2. **Face Recognition** → Compares detected faces with registered profile pictures.
3. **Consent Requests Sent** → Users receive notifications if their face is found.
4. **Users Approve/Reject** → Consent decision recorded.
5. **Final Decision**:
   - ✅ If all matched users **approve**, image is published.
   - ❌ If **anyone rejects**, upload is discarded.

---

## 🔐 Security Measures
- **JWT-based Authentication**: Ensures secure login and session management.
- **Encrypted API Keys**: Environment variables used to protect sensitive information.
- **Access Control**: Only authenticated users can upload images or approve requests.

---

## 🎉 Future Improvements
- 📌 Implement **real-time notifications** using WebSockets.
- 📌 Add **email notifications** for consent requests.
- 📌 Improve **face recognition accuracy** with additional AI models.
- 📌 Build a **mobile-friendly UI** with React or Vue.

---

## 🏆 Hackathon Submission Details
- **Project Name**: Consent-Based Face Recognition Notification System
- **Team Name**: BobTheBuilder
- **Category**: Cyber-Security
- **Tech Stack**: MongoDB, Express.js, Node.js, Face++ API, EJS

---

## 📝 Contributors
- **Ruchi** - Team Leader
- **Pavitra Asthana** - Team member 2
- **Rishika Singh** - Team member 3

---

## 🤝 Acknowledgments
- **Face++ API** for providing face recognition capabilities.
- **MongoDB Atlas** for cloud database hosting.
- **HackJMI 2025 Hackathon Organizers** for the opportunity to showcase this project.

---

## 📞 Contact
For any queries or suggestions, feel free to reach out at **ruchi.cse31@gmail.com**.

---
🚀 **Let's revolutionize privacy in social media with AI-driven consent-based notifications!**

