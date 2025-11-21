// api/define.js
// Vercel serverless function - basit ücretsiz sözlük endpointi
export default async function handler(req, res) {
  const word = (req.query.word || "").trim();
  if (!word) return res.status(400).json({ error: "word parameter missing" });

  // 1) dictionaryapi.dev (FREE)
  try {
    const r = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (r.ok) {
      const data = await r.json();
      const meanings = (data[0]?.meanings || []).flatMap(m => (m.definitions || []).map(d => d.definition));
      const example = (data[0]?.meanings?.[0]?.definitions?.[0]?.example) ||
                      `This is an example sentence using the word "${word}".`;
      return res.json({ word, meanings, example, source: "dictionaryapi" });
    }
  } catch (e) {}

  // 2) Glosbe fallback
  try {
    const r2 = await fetch(`https://glosbe.com/gapi/translate?from=eng&dest=tur&format=json&phrase=${encodeURIComponent(word)}`);
    if (r2.ok) {
      const data2 = await r2.json();
      const meanings = (data2?.tuc || []).flatMap(t => t?.phrase?.text ? [t.phrase.text] : []);
      const example = meanings.length ? `Example: ${word} ...` : `This is an example sentence using the word "${word}".`;
      return res.json({ word, meanings, example, source: "glosbe" });
    }
  } catch (e) {}

  // 3) Final fallback
  return res.json({
    word,
    meanings: [],
    example: `This is an example sentence using the word "${word}".`,
    source: "fallback"
  });
}

