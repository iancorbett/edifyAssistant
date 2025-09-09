import 'dotenv/config';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const KB = JSON.parse(fs.readFileSync('./kb.json', 'utf8')); //loads kb from kb.json

function cosineSim(a, b) { //a and b are arrays (vectors), each is 512 numbers long
    let dot = 0, na = 0, nb = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i]; //Computes the dot product of the two vectors
      na  += a[i] * a[i]; //Compute the squared lengths (magnitudes) of each vector
      nb  += b[i] * b[i];
    }
    return dot / (Math.sqrt(na) * Math.sqrt(nb) + 1e-8); //returns output between -1 and 1
  }

  async function embedAll(texts) {
    const res = await openai.embeddings.create({//Calls the OpenAI API to generate embeddings.
      model: 'text-embedding-3-small',//Returns 1,536-dimension vectors (small, cheap, fast)
      input: texts //Each string will get its own embedding.
    });
    return res.data.map(d => d.embedding); //Extracts just the .embedding array (the vector of floats)
  }

  let kbIndex = [];
  async function buildIndex() {//build an embedding index of your KB (so queries can be matched quickly)
    const texts = KB.map(x => x.q + '\n' + (x.a || '')); //For each entry, it takes the question (q) plus the answer (a), joined with a newline (\n)
    const embs = await embedAll(texts); //Returns an array of embeddings (each is a 1536-number vector from text-embedding-3-small)
    kbIndex = embs.map((emb, i) => ({ ref: KB[i], emb }));//Loops through each embedding (emb) with its index i
    console.log(`Indexed ${kbIndex.length} KB items.`);
  }
  await buildIndex();

  function topK(queryEmb, k = 3) {//selects top 3 matches
    const scored = kbIndex.map(x => ({ ref: x.ref, score: cosineSim(queryEmb, x.emb) }));//map through each index in knowledge base and run similarity function to determine how similar each kb index is to the query
    scored.sort((a, b) => b.score - a.score);//sort from most to least similar
    return scored.slice(0, k);//takes first three from the sorted array
  }

  app.get('/health', (_, res) => res.json({ ok: true }));