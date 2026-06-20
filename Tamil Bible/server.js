import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { searchBible, buildIndex, extractVersesFromText } from './src/services/bibleSearch.js';
import { generateChatResponse } from './src/services/chatService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

let bibleIndex = null;

// Load and index Bible data
console.log('Loading Bible database...');
try {
  const bibleDataPath = path.join(__dirname, 'tamil_bible_full.json');
  const bibleData = JSON.parse(fs.readFileSync(bibleDataPath, 'utf8'));
  
  // Enrich data
  const enriched = bibleData.map((v, i) => {
    const cleanVerse = String(v.verse).replace(/[a-zA-Z]/g, '');
    let cleanText = v.text.replace(/\\s*\\b\\d+[a-zA-Z]\\b\\s*/g, ' ').trim();
    
    // Remove stray section headings accidentally appended to the end of verses
    // Example: "ஆமென். 10. முடிவுரை" -> "ஆமென்."
    cleanText = cleanText.replace(/\s+\d+\.\s+[\u0B80-\u0BFF\s,.'"-]+$/, '').trim();
    return {
      ...v, 
      id: i + 1,
      ref: `${v.book} ${v.chapter}:${cleanVerse}`,
      text: cleanText,
    };
  });

  console.log('Building search index...');
  bibleIndex = buildIndex(enriched);
  console.log('Search index built successfully.');
} catch (error) {
  console.error('Failed to load or index Bible data:', error);
  process.exit(1);
}

// Healthcheck endpoint
app.get('/', (req, res) => {
  res.send('Tamil Bible Chatbot API is running.');
});

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { query, history = [], bookFilter = 'all' } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required and must be a string.' });
    }

    // Perform the local search
    const results = searchBible(bibleIndex, query.trim(), 12, bookFilter);

    // Call Gemini via chatService
    const finalAnswer = await generateChatResponse(query, history, results);

    // Extract any additional references Gemini cited in its answer
    const extractedVerses = extractVersesFromText(finalAnswer, bibleIndex.verses);
    
    // Merge extracted verses with original search results, prioritizing the ones Gemini actually used!
    const finalReferences = [];
    const seenRefs = new Set();
    
    for (const v of extractedVerses) {
      if (!seenRefs.has(v.ref)) {
        seenRefs.add(v.ref);
        finalReferences.push(v);
      }
    }
    
    for (const v of results) {
      if (!seenRefs.has(v.ref)) {
        seenRefs.add(v.ref);
        finalReferences.push(v);
      }
    }

    res.json({
      answer: finalAnswer,
      references: finalReferences
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'An error occurred processing your request.' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
