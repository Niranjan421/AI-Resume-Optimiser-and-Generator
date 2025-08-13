import express from 'express';
import multer from 'multer';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-pro';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// Multer setup for in-memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only PDF and DOC/DOCX files are allowed'));
  },
  limits: { fileSize: 8 * 1024 * 1024 },
});

// Gemini setup
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn('Warning: GEMINI_API_KEY not set. Set it in .env');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// (Optional) helper space reserved if future file helpers are needed

// Convert file bytes to Gemini inlineData part
function toGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString('base64'),
      mimeType,
    },
  };
}

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Optimize endpoint
app.post('/api/optimize', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = (req.body.jobDescription || '').toString().trim();
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert resume writer and ATS optimization specialist.
Goal: Parse the attached resume file, analyze the provided job description, and produce:
1) An optimized, ATS-friendly resume in clean semantic HTML only (no <html>, <head>, or <body> tags). Use h2 for section headers, h3 for subheaders, ul/li for bullets, and strong/em where relevant. Keep design minimalistic and professional. Do not include inline styles; use semantic classes where helpful.
2) A brief JSON object named CHANGES_SUMMARY describing changes made with keys: keywordsAdded (array of strings), sectionsImproved (array of strings), formattingAdjustments (array of strings), rationale (short string).

Guidelines:
- Extract content from the uploaded resume and rewrite it to align with the job description.
- Preserve truthful accomplishments; do not fabricate experience. You may rephrase, reorder, and highlight relevant skills.
- Include a concise Professional Summary tailored to the role.
- Emphasize quantifiable achievements where present in the resume; do not invent numbers.
- Ensure ATS-friendly formatting: clear headings, bullet lists, standard section names, no tables, no columns, no images.
- Include a dedicated Skills section that maps to job keywords.
- Focus on clarity, impact, and keyword alignment for ATS matching.

Return strictly in the following JSON format:
{
  "optimizedHtml": "...clean HTML for the resume...",
  "changes": CHANGES_SUMMARY
}
`;

    const resumePart = toGenerativePart(req.file.buffer, req.file.mimetype);

    const parts = [
      { text: prompt },
      { text: '\nJob Description:\n' + jobDescription + '\n' },
      { text: '\nResume File (analyze the attached file bytes):' },
      resumePart,
    ];

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const responseText = result.response.text();

    // Robustly extract JSON from the response (handles fenced code blocks and trailing text)
    function extractJsonBlock(text) {
      // ```json ... ```
      const fenceJson = text.match(/```\s*json\s*([\s\S]*?)```/i);
      if (fenceJson && fenceJson[1]) return fenceJson[1].trim();
      // ``` ... ```
      const fenceAny = text.match(/```\s*([\s\S]*?)```/);
      if (fenceAny && fenceAny[1]) return fenceAny[1].trim();
      // Fallback: substring from first { to last }
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        return text.substring(first, last + 1).trim();
      }
      return null;
    }

    const jsonStr = extractJsonBlock(responseText);
    if (!jsonStr) {
      return res.status(502).json({ error: 'Invalid response from AI (no JSON found)' });
    }
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return res.status(502).json({ error: 'Failed to parse AI response JSON' });
    }

    if (!parsed.optimizedHtml || !parsed.changes) {
      return res.status(502).json({ error: 'AI response missing required fields' });
    }

    return res.json({ optimizedHtml: parsed.optimizedHtml, changes: parsed.changes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err?.message });
  }
});

// ATS Score Checker endpoint
app.post('/api/ats-score', upload.single('resume'), async (req, res) => {
  try {
    const jobDescription = (req.body.jobDescription || '').toString().trim();
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' });
    }

    if (!genAI) {
      return res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are an expert ATS (Applicant Tracking System) analyst. Analyze the attached resume against the provided job description and provide a comprehensive ATS compatibility score and detailed feedback.

Return strictly in the following JSON format:
{
  "overallScore": 85,
  "scoreBreakdown": {
    "keywordMatch": 90,
    "formatting": 85,
    "contentRelevance": 80,
    "structure": 90
  },
  "detailedFeedback": {
    "strengths": ["Clear section headers", "Good use of action verbs", "Quantified achievements"],
    "weaknesses": ["Missing some key industry terms", "Could improve skills section"],
    "keywordAnalysis": {
      "matched": ["project management", "agile", "leadership"],
      "missing": ["scrum", "stakeholder management"],
      "suggested": ["scrum methodology", "stakeholder communication"]
    },
    "formattingIssues": ["No critical issues found", "Good use of bullet points"],
    "recommendations": [
      "Add 'scrum' and 'stakeholder management' to skills section",
      "Include more industry-specific terminology",
      "Consider adding certifications section if applicable"
    ]
  },
  "atsCompatibility": "High - Resume should pass through most ATS systems successfully"
}

Guidelines for scoring:
- Overall Score: 0-100 (Excellent: 90+, Good: 80-89, Fair: 70-79, Poor: <70)
- Keyword Match: How well resume keywords align with job description
- Formatting: ATS-friendly structure, no tables, clear headers
- Content Relevance: How well experience matches job requirements
- Structure: Logical organization and standard section names

Analyze the resume thoroughly and provide honest, actionable feedback.`;

    const resumePart = toGenerativePart(req.file.buffer, req.file.mimetype);

    const parts = [
      { text: prompt },
      { text: '\nJob Description:\n' + jobDescription + '\n' },
      { text: '\nResume File (analyze the attached file bytes):' },
      resumePart,
    ];

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const responseText = result.response.text();

    // Extract JSON from the response
    function extractJsonBlock(text) {
      const fenceJson = text.match(/```\s*json\s*([\s\S]*?)```/i);
      if (fenceJson && fenceJson[1]) return fenceJson[1].trim();
      const fenceAny = text.match(/```\s*([\s\S]*?)```/);
      if (fenceAny && fenceAny[1]) return fenceAny[1].trim();
      const first = text.indexOf('{');
      const last = text.lastIndexOf('}');
      if (first !== -1 && last !== -1 && last > first) {
        return text.substring(first, last + 1).trim();
      }
      return null;
    }

    const jsonStr = extractJsonBlock(responseText);
    if (!jsonStr) {
      return res.status(502).json({ error: 'Invalid response from AI (no JSON found)' });
    }
    
    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      return res.status(502).json({ error: 'Failed to parse AI response JSON' });
    }

    if (!parsed.overallScore || !parsed.scoreBreakdown || !parsed.detailedFeedback) {
      return res.status(502).json({ error: 'AI response missing required fields' });
    }

    return res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err?.message });
  }
});

// Serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


