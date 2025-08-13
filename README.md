# AI Resume Optimizer & ATS Score Checker

A powerful web application that uses Google's Gemini AI to optimize resumes for ATS (Applicant Tracking System) compatibility and provides detailed scoring analysis.

## ✨ Features

### 🚀 Resume Optimization
- **AI-Powered Optimization**: Uses Gemini 2.5 Flash to analyze and rewrite resumes
- **Job Description Matching**: Tailors resume content to specific job requirements
- **ATS-Friendly Formatting**: Ensures compatibility with Applicant Tracking Systems
- **Semantic HTML Output**: Generates clean, structured HTML for easy editing

### 📊 ATS Score Checker
- **Comprehensive Scoring**: Overall ATS compatibility score (0-100)
- **Detailed Breakdown**: Individual scores for keyword match, formatting, content relevance, and structure
- **Keyword Analysis**: Identifies matched, missing, and suggested keywords
- **Actionable Feedback**: Specific recommendations for improvement
- **Visual Score Display**: Color-coded scoring system for easy interpretation

### 🔒 Privacy & Security
- **In-Memory Processing**: Files are processed in memory and not stored on disk
- **No Data Persistence**: Your resume data is never saved or logged
- **Secure API**: Uses environment variables for API key management

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js
- **AI Engine**: Google Gemini 2.5 Flash API
- **Frontend**: Vanilla JavaScript + Modern CSS
- **File Handling**: Multer for secure file uploads
- **Styling**: Custom CSS with modern design principles

## 📋 Prerequisites

- Node.js (v16 or higher)
- Google Gemini API key
- Modern web browser

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone 
   cd ai-resume-optimizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔑 Getting Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## 📖 Usage

### Resume Optimization
1. **Upload Resume**: Select a PDF, DOC, or DOCX file
2. **Paste Job Description**: Enter the target job description
3. **Click "Optimize Resume"**: AI will analyze and optimize your resume
4. **Review Results**: Check the optimized HTML and summary of changes
5. **Download**: Save the optimized resume as HTML

### ATS Score Analysis
1. **Upload Resume**: Select your resume file
2. **Enter Job Description**: Paste the job description
3. **Click "Check ATS Score"**: Get comprehensive ATS compatibility analysis
4. **Review Score**: See overall score and detailed breakdown
5. **Improve**: Follow recommendations to enhance ATS compatibility

## 📁 Project Structure

```
ai-resume-optimizer/
├── server.js              # Express server with API endpoints
├── package.json           # Dependencies and scripts
├── env.example                   # Environment variables (create this)
├── public/
│   ├── index.html        # Main application interface
│   ├── styles.css        # Application styling
│   └── favicon.ico       # App icon
└── README.md             # This file
```


## 🎨 Customization

### Styling
- Modify `public/styles.css` to customize the appearance
- Update color variables in the `:root` selector
- Adjust layout and spacing as needed

### AI Prompts
- Customize AI behavior by modifying prompts in `server.js`
- Adjust scoring criteria in the ATS analysis endpoint
- Fine-tune optimization guidelines

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
```env
GEMINI_API_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

- This tool is for educational and professional development purposes
- Always review AI-generated content before submitting applications
- The tool does not guarantee job offers or interview invitations
- Use responsibly and ethically

## 🆘 Support

If you encounter any issues:

1. Check the browser console for error messages
2. Verify your Gemini API key is correct
3. Ensure your resume file is in a supported format
4. Check that the job description is not empty



## 🙏 Acknowledgments

- Google Gemini AI for providing the AI capabilities
- Express.js community for the robust web framework
- Open source contributors for various dependencies

---






