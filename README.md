<img width="1919" height="1053" alt="Screenshot 2026-04-01 022715" src="https://github.com/user-attachments/assets/17320fe0-e7fb-4c9d-bbdb-ddf4b2a4eeaa" /><div align="center"><h2>⚡ Verix AI</h2></div>
<div align="center">AI + Blockchain Deepfake Detection System</div>
<p align="center"> Detect AI-generated media, verify authenticity using blockchain, and generate QR-based verification reports. </p> 
<p align="center"> 
<img src="https://img.shields.io/badge/React-Frontend-blue?style=for-the-badge&logo=react" /> 
<img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" /> 
<img src="https://img.shields.io/badge/Blockchain-Ethereum-purple?style=for-the-badge&logo=ethereum" /> 
<img src="https://img.shields.io/badge/AI-Sightengine-orange?style=for-the-badge" /> 
<img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" /> 
<img src="https://img.shields.io/badge/Render-API-purple?style=for-the-badge" /> 
</p>

---

## 🚀 Live App

Frontend: https://verix-ai.vercel.app  
Backend API: https://verix-ai-1doz.onrender.com  

---

## ✨ Features

- 🧠 AI-powered deepfake detection (real vs fake with confidence)
- 🔐 Blockchain-based authenticity verification
- 🧾 Unique SHA-256 hash generation for every file
- 📜 History tracking of uploaded media
- 🔍 Verify previously uploaded files instantly
- 📂 Drag & drop modern UI
- 📊 Confidence scoring system
- 📄 Downloadable verification report
- 🔗 QR code inside report for instant validation
- ☁️ Fully deployed (Frontend + Backend)

---

## 📸 Screenshots

Upload & Analyze 

(Fake)<img width="1919" height="1022" alt="Screenshot 2026-04-01 021810" src="https://github.com/user-attachments/assets/f180ce1b-ec76-4516-b7f8-069ffddc03cb" /><img width="1919" height="870" alt="Screenshot 2026-04-01 021839" src="https://github.com/user-attachments/assets/ea3d171c-34bf-44ee-b19b-7c17546a84d1" />
(Real)<img width="1919" height="902" alt="Screenshot 2026-04-01 022239" src="https://github.com/user-attachments/assets/6c646a75-8257-4f9a-9742-1d0f51acc877" />

Report with QR  
<img width="1919" height="1031" alt="Screenshot 2026-04-01 021847" src="https://github.com/user-attachments/assets/11520c9a-0b15-41ed-80d0-5f92104a490c" />

History Page  
<img width="1919" height="1023" alt="Screenshot 2026-04-01 022258" src="https://github.com/user-attachments/assets/838bdff1-74b6-4d9a-bb0f-bdff2ae0988a" />

Front-end
<img width="1919" height="1052" alt="Screenshot 2026-04-01 021253" src="https://github.com/user-attachments/assets/8a47d0cc-c2f0-40ce-a82d-c770efd9590e" />

Back-end
<img width="1918" height="1051" alt="Screenshot 2026-04-01 021303" src="https://github.com/user-attachments/assets/8e0cd96a-2709-4ad7-a5d8-ea80379cf00f" />

</>
<img width="1919" height="1052" alt="Screenshot 2026-04-01 022523" src="https://github.com/user-attachments/assets/d2ffeab0-1de3-4975-922b-c11f07d2803b" />

Postman(For testing API)
<img width="1919" height="1053" alt="Screenshot 2026-04-01 022715" src="https://github.com/user-attachments/assets/264d5251-7426-47ea-b4da-6ab1fbf0af10" />

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite)
- CSS (Glassmorphism UI)
- Axios
- React Dropzone

**Backend**
- Node.js
- Express.js
- Multer (memory storage)
- File System (history JSON)

**AI**
- Sightengine API

**Blockchain**
- Solidity Smart Contract
- Ethers.js
- Hardhat

**Deployment**
- Vercel (Frontend)
- Render (Backend)

---

## ⚙️ Run Locally

git clone https://github.com/premthoke/Verix-ai.git  
cd Verix-ai  

### Backend

cd server  
npm install  
node app.js  

Create `.env`

PORT=5000  

RPC_URL=http://127.0.0.1:8545  
PRIVATE_KEY=your_private_key  
CONTRACT_ADDRESS=your_contract_address  

SIGHTENGINE_USER=your_user  
SIGHTENGINE_SECRET=your_secret  

### Frontend

cd client  
npm install  
npm run dev  

Create `.env`

VITE_API_URL=http://localhost:5000  

---

## 🎯 Project Purpose

This project demonstrates:

- AI + Blockchain integration  
- media authenticity verification system  
- secure hashing techniques  
- file upload handling in production  
- real-world full-stack deployment  

---

## 🔮 Future Improvements

- Public verification links (shareable URLs)  
- QR-based mobile verification system  
- NFT-based authenticity certificates  
- Analytics dashboard (real vs fake stats)  
- Multi-model AI detection  
- UI/UX enhancements  

---

## ⚠️ Security Notes

- Never commit `.env` files  
- Keep API keys and private keys secure  
- Do not hardcode credentials  
- Use validation and rate limiting  
- Rotate keys if exposed  

---

## 🧑‍💻 Author

Prem Thoke  

---

## ⭐ Support

If you like this project:

- Star this repository  
- Share it  
- Contribute improvements  

---
