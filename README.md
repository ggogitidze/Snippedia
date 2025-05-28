# Snippedia

A platform for sharing and discovering code snippets with GitHub authentication.

## Project Structure

```
snippedia/
├── backend/           # Go backend server
│   ├── .env          # Backend environment variables
│   └── ...
├── src/              # React frontend
│   └── ...
└── .env              # Frontend environment variables
```

## Environment Variables

### Backend (.env in /backend)
```
MONGO_URI=your_mongodb_uri
DB_NAME=Snippedia
PORT=8080
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
JWT_SECRET=your_secure_jwt_secret
ALLOWED_ORIGINS=http://localhost:3000
```

### Frontend (.env in root)
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_FRONTEND_URL=http://localhost:3000
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
```

## Development Setup

1. Clone the repository
2. Set up environment variables
3. Install dependencies:
   ```bash
   # Frontend
   npm install
   
   # Backend
   cd backend
   go mod download
   ```
4. Run the development servers:
   ```bash
   # Frontend
   npm start
   
   # Backend
   cd backend
   go run main.go
   ```

## Deployment

### Backend (Render)
1. Create a new Web Service
2. Connect your GitHub repository
3. Set environment variables
4. Build Command: `cd backend && go build -o main`
5. Start Command: `cd backend && ./main`

### Frontend (Vercel)
1. Create a new project
2. Connect your GitHub repository
3. Set environment variables
4. Deploy

## GitHub OAuth Setup
1. Create a new OAuth App in GitHub
2. Set Homepage URL to your frontend URL
3. Set Authorization callback URL to your backend URL + `/auth/github/callback` 