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