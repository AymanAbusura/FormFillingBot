# Form Filling Bot

This project is a form-filling bot that automates form submissions on specified URLs using a server powered by Puppeteer. It consists of a frontend (React application) hosted on Vercel and a backend (Express server) hosted on Render.

## Table of Contents

* Features
* Technologies Used
* Setup and Installation
* Deployment
* Usage
* Project Structure
* Troubleshooting
* License

### Features

* Accepts a URL and Proxy URL for form filling
* Provides real-time updates on form filling progress via server-sent events
* Displays progress and logs each step

### Technologies Used

* Frontend: ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Axios](https://img.shields.io/static/v1?style=for-the-badge&message=Axios&color=5A29E4&logo=Axios&logoColor=FFFFFF&label=)
* Backend: ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![ExpressJS](https://img.shields.io/badge/Express%20js-000000?style=for-the-badge&logo=express&logoColor=white) ![Puppeteer](https://img.shields.io/badge/Puppeteer-000000?style=for-the-badge&logo=Puppeteer&logoColor=white) ![CORS](https://img.shields.io/badge/CORS-000000?style=for-the-badge&logo=CORS&logoColor=white)
* Hosting: ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-000000?style=for-the-badge&logo=render&logoColor=white)

### Setup and Installation

### Prerequisites
* Node.js (version 12+)
* Git
* Vercel and Render accounts for deployment

### 1. Clone the Repository
```markdown
git clone https://github.com/AymanAbusura/fill_form.git
cd fill_form
```

### 2. Install Dependencies
```markdown
# Frontend
cd frontend
npm install

# Backend
cd ../server
npm install
```

### 3. Environment Variables
Set up environment variables for deployment:

* Backend: In Render, add the environment variable `PORT` (Render assigns this automatically).
* Frontend: On Vercel, set an environment variable `REACT_APP_BACKEND_URL` with the value of the deployed backend URL.

### 4. Run Locally
To test the app locally:
1. Start the backend server:
```markdown
cd server
node server.js
```

2. Start the frontend:
```markdown
cd ../frontend
npm start
```

The frontend should be accessible at `http://localhost:3000`, and the backend should run on `http://localhost:5001`.

### Deployment
### Frontend (Vercel)
1. Go to your Vercel dashboard and create a new project.
2. Select the frontend directory in your repository.
3. In the Vercel settings, add `REACT_APP_BACKEND_URL` pointing to your Render backend URL.
4. Deploy the frontend.

### Backend (Render)
1. Go to your Render dashboard and create a new Web Service.
2. Select the server directory and set the build command to `npm install` and the start command to `node server.js`.
3. Deploy the backend and note the deployed URL.

### Connecting Frontend and Backend
After deployment, ensure the frontend has the correct backend URL in the `REACT_APP_BACKEND_URL` environment variable.

### Usage
1. Visit the frontend URL on Vercel.
2. Enter the form URL and proxy information.
3. Click on "Заполнить Форму" to start the form-filling bot.
4. Watch the progress section for real-time updates on form submissions.

### Project Structure
```markdown
project-root/
├── frontend/               # React frontend
│   ├── src/
│   │   ├── App.js          # Main app component
│   │   ├── App.css         # Styles
│   │   └── ...
│   └── public/
├── server/                 # Node.js backend
│   ├── server.js           # Express server setup
│   ├── data.js             # Form data for filling
│   └── ...
├── LICENSE                 # Project license
└── README.md               # Project documentation
```

### Troubleshooting
### CORS Issues
If you encounter CORS issues, make sure:
* The backend `CORS` configuration allows requests from your frontend’s Vercel domain.
* Verify `REACT_APP_BACKEND_URL` in Vercel is correctly set.

### Common Errors
* `Error: Failed to launch the browser process`: Ensure that Puppeteer is properly installed, or consider using the `puppeteer-core` package with a Chromium installation path.
* Proxy Configuration Errors: Verify that the proxy information is correctly entered.

### License
This project is licensed under the MIT License.
