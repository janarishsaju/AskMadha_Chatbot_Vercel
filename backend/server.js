require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Load Bible Data into Memory
console.log("Loading Bible data...");
const englishPath = path.join(__dirname, "..", "English bible", "English_bible_full.json");

let englishBible = [];

try {
  const rawBible = JSON.parse(fs.readFileSync(englishPath, "utf-8"));
  
  // Fix Deuteronomy chapter 31/32 mapping discrepancy
  // In the raw database, Deuteronomy chapter 32 (Song of Moses) verses 2-52 are stored
  // under chapter 31 (starting over at verse 2 after the actual chapter 31 ends at verse 30).
  let seenDeut31Verses = new Set();
  let inDeut32 = false;
  
  englishBible = rawBible.map(v => {
    if (v.book === "DEUTERONOMY" && v.chapter === 31) {
      const verseNum = parseInt(v.verse);
      if (seenDeut31Verses.has(verseNum) || verseNum === 31 || inDeut32) {
        inDeut32 = true;
        return { ...v, chapter: 32 };
      } else {
        seenDeut31Verses.add(verseNum);
      }
    }
    return v;
  });
  
  console.log("Bible data loaded successfully! (With Deuteronomy 31/32 corrections)");
} catch (error) {
  console.error("Failed to load Bible data:", error);
}

// Expanded stop words — includes pronouns, aux verbs, prepositions, etc.
const stopWords = new Set([
  // Articles
  "a", "an", "the",
  // Conjunctions
  "and", "but", "if", "or", "because", "as", "so", "than", "yet", "nor", "for",
  // Pronouns
  "i", "me", "my", "mine", "myself",
  "you", "your", "yours", "yourself",
  "he", "him", "his", "himself",
  "she", "her", "hers", "herself",
  "it", "its", "itself",
  "we", "us", "our", "ours", "ourselves",
  "they", "them", "their", "theirs", "themselves",
  "who", "whom", "whose", "which", "that",
  "this", "these", "those", "what",
  // Auxiliary / common verbs
  "is", "am", "are", "was", "were", "be", "been", "being",
  "has", "have", "had", "having",
  "do", "does", "did", "doing",
  "will", "would", "shall", "should",
  "may", "might", "must", "can", "could",
  // Prepositions
  "in", "on", "at", "to", "of", "by", "up", "out", "off",
  "from", "with", "into", "over", "under", "about",
  "between", "through", "during", "before", "after",
  "above", "below", "against", "among", "upon",
  // Adverbs & miscellaneous
  "not", "no", "nor", "only", "own", "same",
  "too", "very", "just", "also", "now", "here", "there",
  "when", "where", "why", "how", "again", "further",
  "then", "once", "more", "most", "other", "some",
  "any", "all", "both", "each", "few", "such",
  // Indefinite pronouns and numbers
  "one", "anyone", "everyone", "someone", "nobody", "nothing", "anything", "something",
]);

// ─── Build IDF search index for smarter ranking ───
console.log("Building search index...");
const wordDocFreq = new Map();

// Pre-tokenize every English verse into a Set of words for fast whole-word matching
const englishVerseWords = englishBible.map(verse => {
  const words = new Set(verse.text.toLowerCase().split(/\W+/).filter(w => w.length > 0));
  for (const word of words) {
    wordDocFreq.set(word, (wordDocFreq.get(word) || 0) + 1);
  }
  return words;
});

const totalEnglishDocs = englishBible.length;
console.log(`Search index built: ${totalEnglishDocs} verses, ${wordDocFreq.size} unique terms.`);

function getIDF(word) {
  const df = wordDocFreq.get(word) || 0;
  if (df === 0) return 0;
  return Math.log(totalEnglishDocs / df);
}

// Basic stemmer for query tokens to match more broadly
function getStem(word) {
  if (word.length <= 4) return word;
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es')) return word.slice(0, -2);
  if (word.endsWith('s')) return word.slice(0, -1);
  if (word.endsWith('ed')) return word.slice(0, -2);
  if (word.endsWith('ing')) return word.slice(0, -3);
  return word;
}

// Synonyms to expand theological/common queries
const synonyms = {
  "death": ["die", "died", "dead"],
  "died": ["death", "die", "dead"],
  "die": ["death", "died", "dead"],
  "buried": ["bury", "burial", "tomb"],
  "burial": ["buried", "bury", "tomb"],
  "tomb": ["grave", "buried", "burial"],
  "aron": ["aaron"],
  "breastpiece": ["breast-piece", "breastplate", "breast piece"],
  "breastplate": ["breastpiece", "breast-piece"]
};

// Search function with IDF-weighted scoring, synonyms, and context smoothing
function searchVerses(query) {
  const bible = englishBible;

  // Clean parts split by underscores (for fill-in-the-blank queries)
  const queryParts = query.toLowerCase().split(/_+/).map(p => p.trim()).filter(p => p.length > 2);

  // Extract keywords (filter out stop words), stripping hyphens first
  const cleanQuery = query.toLowerCase().replace(/-/g, '');
  const tokens = cleanQuery.split(/\W+/).filter(word => word.length > 2 && !stopWords.has(word));
  
  // Expand tokens with synonyms
  let expandedTokens = [];
  for (const t of tokens) {
    expandedTokens.push(t);
    if (synonyms[t]) expandedTokens.push(...synonyms[t]);
  }
  expandedTokens = [...new Set(expandedTokens)];

  if (expandedTokens.length === 0 && queryParts.length === 0) {
    return bible.slice(0, 5);
  }

  // Base score for each verse
  const scoredVerses = bible.map((verse, idx) => {
    let score = 0;
    const text = verse.text.toLowerCase();
    const wordSet = englishVerseWords[idx];

    // 1. Exact phrase matching for fill-in-the-blank parts (huge bonus)
    for (const part of queryParts) {
      // Skip phrases that consist entirely of stop words/short words
      const partWords = part.split(/\W+/).filter(w => w.length > 0);
      const hasSignificantWord = partWords.some(w => w.length > 2 && !stopWords.has(w));
      if (!hasSignificantWord) continue;

      if (text.includes(part)) {
        score += 100 * part.length;
      }
    }

    // 2. Token matching — weighted by IDF so rare words score much higher
    let matchedTokens = 0;
    for (const token of expandedTokens) {
      if (wordSet.has(token)) {
        matchedTokens += 1;
        const weight = getIDF(token);
        score += 10 * weight;
      } else {
        // Partial matching for English stems or substrings
        const stem = getStem(token);
        if (text.includes(stem) || text.includes(token)) {
          matchedTokens += 1;
          const weight = getIDF(token);
          score += 8 * weight; // slightly less points for partial match
        }
      }
    }

    // 3. All original tokens matched bonus
    const originalTokensMatched = tokens.filter(t => wordSet.has(t) || text.includes(t)).length;
    if (originalTokensMatched === tokens.length && tokens.length > 0) {
      score += 50;
    }

    // 4. Slight penalty for very long verses to break ties
    if (score > 0) {
      score -= (text.length / 1000);
    }

    return { verse, score, idx };
  });

  // 5. Context Smoothing: give verses 50% of the score of their adjacent verses
  // This allows multi-verse context to bubble up (e.g., "Moses died" in v5 + "buried" in v6)
  const smoothedScores = scoredVerses.map(item => {
    let windowScore = item.score;
    const idx = item.idx;
    if (idx > 0 && bible[idx-1].book === item.verse.book && bible[idx-1].chapter === item.verse.chapter) {
      windowScore += scoredVerses[idx-1].score * 0.5;
    }
    if (idx < bible.length - 1 && bible[idx+1].book === item.verse.book && bible[idx+1].chapter === item.verse.chapter) {
      windowScore += scoredVerses[idx+1].score * 0.5;
    }
    return { verse: item.verse, score: windowScore };
  });

  // Sort and get top 30
  smoothedScores.sort((a, b) => b.score - a.score);
  return smoothedScores.filter(item => item.score > 0).slice(0, 30).map(item => item.verse);
}

// Detect if text contains Tamil script characters
function containsTamilScript(text) {
  return /[\u0B80-\u0BFF]/.test(text);
}

// Use Gemini to detect language and translate Tanglish to Tamil
async function detectLanguage(query, languagePreference = "auto") {
  if (languagePreference === "english") {
    return { lang: "english", query: query };
  }

  // Fast path: if it already contains Tamil script, it's Tamil
  if (containsTamilScript(query)) {
    return { lang: "tamil", query: query };
  }

  let prompt = `Analyze the following text: "${query}"
1. If it is English, return JSON: {"lang": "english", "query": "${query}"}
2. If it is Tamil written in English letters (Tanglish), return JSON with lang="tamil" and the query translated into proper Tamil script. Example for "Kadavul Yaar?": {"lang": "tamil", "query": "கடவுள் யார்?"}
Return ONLY valid JSON.`;

  if (languagePreference === "tamil") {
    prompt = `Analyze the following text: "${query}"
The user's language preference is Tamil. Treat it as Tanglish (Tamil in English letters).
Return JSON with lang="tamil" and the query translated into proper Tamil script. Example for "Kadavul Yaar?": {"lang": "tamil", "query": "கடவுள் யார்?"}
Return ONLY valid JSON.`;
  }

  try {
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    for (const modelName of models) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName, generationConfig: { responseMimeType: "application/json" } });
        const result = await model.generateContent(prompt);
        const data = JSON.parse(result.response.text());
        console.log(`Language detected: ${data.lang} (via ${modelName})`);
        return { lang: data.lang || "english", query: data.query || query };
      } catch (err) {
        console.warn(`Language detection with ${modelName} failed: ${err.status || err.message}`);
        if (err.status === 429 || err.status === 503) continue;
        break;
      }
    }
  } catch (e) {
    console.error("Language detection error:", e);
  }
  return { lang: "english", query: query };
}

// Semantic reference finder using Gemini
async function findReferencesWithLLM(query) {
  const prompt = `You are a Bible reference finder.
User query: "${query}"

INSTRUCTIONS:
1. Find the most relevant Bible verses that answer the query or match the statement (up to 5).
2. If the user query is a fill-in-the-blank question (containing underscores like "_______" or "___"), identify the possible biblical phrases that could fill the blank (e.g., "hung on a tree" in Deuteronomy 21:23 / Galatians 3:13, or "does not abide by all things..." in Deuteronomy 27:26 / Galatians 3:10). Return the references for all likely biblical matches that complete the phrase.
3. Return ONLY a valid JSON list of objects. Each object must have keys: "book" (string, fully capitalized like "GENESIS"), "chapter" (integer), "verse" (string).
If no verses match, return [].
Example: [{"book": "DEUTERONOMY", "chapter": 19, "verse": "15"}]`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", generationConfig: { responseMimeType: "application/json" } });
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error("LLM reference retrieval error:", err);
    return [];
  }
}


// Forward a query to the Tamil Bible API at port 3000
async function forwardToTamilApi(query) {
  const response = await fetch("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  });
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Tamil API error (${response.status}): ${errText}`);
  }
  return response.json();
}

app.post("/api/chat", async (req, res) => {
  const { query, languagePreference } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required." });
  }

  try {
    // Step 1: Detect language (English, Tamil, or Tanglish)
    const detected = await detectLanguage(query, languagePreference);
    console.log(`Query: "${query}" → Detected: ${detected.lang}, Translated: "${detected.query}"`);

    // Step 2: If Tamil/Tanglish, forward to the Tamil Bible API
    if (detected.lang === "tamil") {
      try {
        const tamilResult = await forwardToTamilApi(detected.query);
        return res.json({
          answer: tamilResult.answer,
          sources: tamilResult.references || []
        });
      } catch (tamilErr) {
        console.error("Tamil API forwarding failed:", tamilErr.message);
        return res.status(500).json({ error: "Tamil Bible service is unavailable. Please try again." });
      }
    }

    // Step 3: English path — search English Bible
    let semanticVerses = [];
    try {
      const llmRefs = await findReferencesWithLLM(query);
      for (const ref of llmRefs) {
        if (!ref || typeof ref !== "object") continue;
        const book = String(ref.book || "").toUpperCase();
        const chapter = parseInt(ref.chapter);
        const verseStr = String(ref.verse || "").trim();
        
        // Helper to expand ranges (e.g. "51-52" -> ["51", "52"])
        let versesToFind = [verseStr];
        if (verseStr.includes('-')) {
          const parts = verseStr.split('-');
          const start = parseInt(parts[0]);
          const end = parseInt(parts[1]);
          if (!isNaN(start) && !isNaN(end) && start <= end && end - start < 10) {
            versesToFind = [];
            for (let i = start; i <= end; i++) {
              versesToFind.push(String(i));
            }
          }
        }
        
        for (const v of versesToFind) {
          const match = englishBible.find(item => item.book === book && item.chapter === chapter && item.verse === v);
          if (match) semanticVerses.push(match);
        }
      }
    } catch (e) {
      console.error("Failed to parse LLM refs:", e);
    }

    const keywordVerses = searchVerses(query);
    
    // Combine uniquely
    const relevantVerses = [];
    const seen = new Set();
    for (const v of [...semanticVerses, ...keywordVerses]) {
      const vId = `${v.book}_${v.chapter}_${v.verse}`;
      if (!seen.has(vId)) {
        seen.add(vId);
        relevantVerses.push(v);
        if (relevantVerses.length >= 30) break;
      }
    }

    let contextText = relevantVerses.map(v => `${v.book} ${v.chapter}:${v.verse} - "${v.text}"`).join("\n");
    
    if (relevantVerses.length === 0) {
        contextText = "No direct verses found matching the keywords.";
    }

    const prompt = `You are an expert, precise Bible Chatbot.
The user asked a question or provided a fill-in-the-blank phrase, and I have found the following most relevant verses from the english Bible text provided by the user:

${contextText}

User's input: ${query}

CRITICAL INSTRUCTIONS:
1. Primary Source: Base your answers on the provided context verses. If the provided verses mention a term or person but do not fully explain their meaning or background (like "Azazel"), you MUST use your general biblical knowledge to provide a full and accurate answer.
2. If the user's input contains blanks (like _______), you MUST find the specific verse in the context that matches the text before/after the blanks. Note that the blank phrase might be a paraphrase or come from a different Bible translation (such as NIV) than the provided ESV text (e.g., "Any one hung on a tree is under God’s curse" is the NIV translation corresponding to Deuteronomy 21:23, where ESV says "a hanged man is cursed by God"). In such cases, identify the correct verse by its meaning and theology, fill in the blank to match the expected biblical completion, and cite the correct verse.
3. Fill in the blanks exactly as the text appears in the matching verse (or standard translation representing the blank if it differs from ESV), and explicitly cite the verse using standard English abbreviations (e.g., "Deut 21:23").
4. You are allowed and encouraged to use your broader biblical knowledge to explain meanings of words, historical context, or theological concepts that the provided verses touch upon.
5. FORMATTING: First, answer the question directly and concisely in a single sentence. If the question asks why an event happened and there is a verse in the context that gives the direct biblical explanation, you MUST prioritize using the phrasing of that specific verse in your first sentence, and you MUST NOT repeat or paraphrase the question in your first sentence (e.g., do NOT start with "God forbade Moses because..." or "Moses was forbidden to enter the Promised Land because..."). Jump straight to the direct biblical statement (e.g., answering "Why did God forbid Moses to enter the Promised Land?" with "Moses broke faith with God in the midst of the people of Israel at the waters of Meribah-kadesh, in the wilderness of Zin (Deut 32:51)"). Then, if needed, you may provide a brief explanation based on the user's question. DO NOT include conversational fillers like "Based on the provided verses...", "Based on the provided context...", or "According to the provided text". Give the answer directly.
6. ABBREVIATE CITATIONS: When displaying Bible references in your answer, you MUST convert full book names into standard 3-4 letter English abbreviations (e.g., use 'Deut 2:5' instead of 'Deuteronomy 2:5', use 'Lev 25' instead of 'Leviticus 25'). NEVER use the full book name in citations.`;

    // Retry logic with fallback model
    const models = ["gemini-2.5-flash", "gemini-2.0-flash"];
    let lastError = null;

    for (const modelName of models) {
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Trying ${modelName} (attempt ${attempt})...`);
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent(prompt);
          const responseText = result.response.text();

          const ansLower = responseText.toLowerCase();
          const filteredVerses = relevantVerses.filter(v => {
            const chapVerse = `${v.chapter}:${v.verse}`;
            return ansLower.includes(chapVerse);
          });

          return res.json({
              answer: responseText,
              sources: filteredVerses
          });
        } catch (retryError) {
          lastError = retryError;
          console.warn(`${modelName} attempt ${attempt} failed: ${retryError.status || retryError.message}`);
          if (retryError.status === 429 || retryError.status === 503) {
            // Wait before retrying (exponential backoff)
            const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000);
            await new Promise(resolve => setTimeout(resolve, waitMs));
            continue;
          }
          // For non-retryable errors, break out of retry loop
          break;
        }
      }
    }

    // If all retries and models failed
    console.error("All model attempts failed:", lastError);
    res.status(500).json({ error: "The AI service is currently busy. Please try again in a moment." });

  } catch (error) {
    console.error("Error generating response:", error);
    res.status(500).json({ error: "An error occurred while generating the response." });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
