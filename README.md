# Snippedia

**Snippedia** is a modern, full-stack web application for sharing, discovering, and bookmarking code snippets. It features GitHub OAuth authentication, a social feed, and a mobile-friendly responsive UI.

---

## 🚀 Live Demo

- **Frontend:** [https://snippedia.vercel.app](https://snippedia.vercel.app)


---

## 🛠 Tech Stack

- **Frontend:** React (with Tailwind CSS for styling)
- **Backend:** Go (Fiber web framework)
- **Database:** MongoDB Atlas (cloud-hosted)
- **Authentication:** GitHub OAuth + JWT
- **Deployment:**  
  - Frontend: Vercel  
  - Backend: Render

---

## ✨ Features

- **GitHub Login:** Secure OAuth authentication.
- **Feed:** Browse, search, and filter code snippets.
- **Snippet Details:** View, bookmark, and react to snippets.
- **User Profiles:** See your own and others' snippets and bookmarks.
- **Mobile-First Design:** Fully responsive for phones, tablets, and desktops.
- **Bookmarking & Reactions:** Save favorites and react to useful code.

---

## 📁 Project Structure

```
snippedia/
├── backend/           # Go backend server (API)
│   └── ...
├── src/               # React frontend
│   └── ...
├── .env               # Frontend environment variables
└── README.md
```

---

## ⚙️ Environment Variables

### Backend (`/backend/.env` on Render)
```
MONGO_URI=your_mongodb_atlas_uri
DB_NAME=Snippedia
PORT=8080
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://snippedia.vercel.app
```

### Frontend (`.env` in project root, on Vercel)
```
REACT_APP_API_URL=https://snippedia.onrender.com
REACT_APP_FRONTEND_URL=https://snippedia.vercel.app
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

---

## 🖥️ Local Development

1. **Clone the repo:**
   ```bash
   git clone https://github.com/ggogitidze/Snippedia.git
   cd Snippedia
   ```

2. **Set up environment variables:**  
   - Copy `.env.example` files (if present) or create `.env` files as above.

3. **Start the backend:**
   ```bash
   cd backend
   go run main.go
   ```

4. **Start the frontend:**
   ```bash
   cd ..
   npm install
   npm start
   ```

5. **Visit:**  
   - Frontend: [http://localhost:3000](http://localhost:3000)  
   - Backend API: [http://localhost:8080](http://localhost:8080)

---

## 🌐 Deployment

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 👤 Author

- **Giorgi Gogitidze**  
  [GitHub](https://github.com/ggogitidze)

---

## 📣 Recruiter Notes

- **Modern, production-ready stack:** React, Go, MongoDB, JWT, OAuth.
- **Cloud-native deployment:** Vercel & Render.
- **Security best practices:** No secrets in repo, JWT not logged, CORS configured.
- **Mobile-first:** Fully responsive, tested on phones and tablets.
- **Clean code:** Modular, well-commented, and easy to extend.

---

> **Thank you for reviewing Snippedia! Feel free to reach out for a walkthrough or questions.** 