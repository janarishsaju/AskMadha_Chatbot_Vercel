const fs = require('fs');
const path = require('path');

const dirPath = path.join(__dirname, '..', 'TNBCLC-BSI', 'Notepad Documents');
const outPath = path.join(__dirname, '..', 'tamil_bible_full.json');

function parseSFM(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  let bookName = '';
  let currentChapter = 0;
  let currentVerse = '';
  let currentText = '';
  let toc2Name = '';
  let hName = '';

  const verses = [];

  function saveVerse() {
    if (bookName && currentChapter > 0 && currentVerse && currentText.trim()) {
      verses.push({
        book: bookName,
        chapter: currentChapter,
        verse: currentVerse,
        text: currentText.trim().replace(/\s+/g, ' ')
      });
    }
  }

  for (let line of lines) {
    if (line.startsWith('\\h ')) {
      hName = line.substring(3).trim();
      if (!bookName) bookName = hName;
    } else if (line.startsWith('\\toc2 ')) {
      toc2Name = line.substring(6).trim();
      bookName = toc2Name; // prefer toc2Name
    } else if (line.startsWith('\\c ')) {
      saveVerse();
      currentVerse = '';
      currentText = '';
      currentChapter = parseInt(line.substring(3).trim(), 10);
    } else if (line.startsWith('\\v ')) {
      saveVerse();
      const match = line.match(/^\\v\s+(\d+(?:-\d+)?(?:[a-z])?)\s+(.*)/);
      if (match) {
        currentVerse = match[1];
        currentText = match[2];
      } else {
        const parts = line.substring(3).trim().split(' ');
        currentVerse = parts[0];
        currentText = parts.slice(1).join(' ');
      }
    } else if (line.startsWith('\\p') || line.startsWith('\\q') || line.startsWith('\\m') || line.startsWith('\\b') || line.startsWith('\\pi') || line.startsWith('\\mi') || line.startsWith('\\d')) {
      const textMatch = line.match(/^\\[a-z0-9]+\s*(.*)/);
      if (textMatch && textMatch[1].trim()) {
        if (currentVerse) {
          currentText += ' ' + textMatch[1].trim();
        }
      }
    } else if (line.startsWith('\\')) {
      // ignore other tags
    } else {
      if (currentVerse && line.trim()) {
        currentText += ' ' + line.trim();
      }
    }
  }
  
  saveVerse();

  verses.forEach(v => {

    // Strip footnotes \f ... \f*
    v.text = v.text.replace(/\\f\s+.*?\\f\*/g, '');
    // Strip cross references \x ... \x*
    v.text = v.text.replace(/\\x\s+.*?\\x\*/g, '');
    // Strip other trailing simple tags
    v.text = v.text.replace(/\\[a-z0-9]+\s*/g, '');
    // Remove standalone asterisks * that were used as footnote markers
    v.text = v.text.replace(/\*/g, '');
    // Clean up spaces
    v.text = v.text.replace(/\s+/g, ' ').trim();
  });

  return verses;
}

function main() {
  console.log('Reading files from:', dirPath);
  let allVerses = [];
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.SFM'));
  
  for (const file of files) {
    const verses = parseSFM(path.join(dirPath, file));
    allVerses = allVerses.concat(verses);
  }
  
  console.log('Processed', files.length, 'files');
  console.log('Total verses extracted:', allVerses.length);
  
  // Write out as JSON
  fs.writeFileSync(outPath, JSON.stringify(allVerses, null, 2), 'utf8');
  console.log('Successfully wrote to', outPath);
}

main();
