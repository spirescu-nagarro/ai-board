# How to set up AI-Board
AI-Board consists of two parts: the backend and the frontend. The backend is a REST API written in Node.js using Express and the frontend is a Javascript Application using Konva.js.

For both parts, you need to have Node.js installed on your machine. You can download it from https://nodejs.org/en/download/.

You can clone the repository using the following command:
git clone https://github.com/spirescu-nagarro/ai-board.git

## Frontend
- Run `npm install` inside the `ai-board/app` folder
- Run `npm run serve` inside the `ai-board/app` folder
- The frontend will be available at http://localhost:8080

## Backend
- Add a `credentials.json` file inside the `ai-board/backend` folder with the content provided by the google cloud vision API. It should have this structure:
```json
{
  "type": "service_account",
  "project_id": "???",
  "private_key_id": "???",
  "private_key": "???",
  "client_email": "???",
  "client_id": "???",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "???"
}

```
- Run `npm install` inside the `ai-board/backend` folder
- Run `npm start` inside the `ai-board/backend` folder
- The backend will be available at http://localhost:3000


## Use the deployed Web App
You might also want to skip the setup and use the deployed Web App. It is available at https://ai-board.de.

You can visit our landing page at https://www.ai-board.de.
