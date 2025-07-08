import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';
import { isSuspiciousDomain, getFraudRiskScore, routeProvider, ChargeRequest } from './fraud';

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY';

app.use(bodyParser.json());

interface TransactionLog {
  transactionId: string;
  provider: string;
  status: string;
  riskScore: number;
  explanation: string;
  timestamp: string;
  metadata: ChargeRequest;
}

const transactions: TransactionLog[] = [];

async function getLLMRiskSummary(payload: ChargeRequest, riskScore: number, provider: string): Promise<string> {
  const prompt = `Payment request: ${JSON.stringify(payload)}\nFraud risk score: ${riskScore}\nProvider: ${provider}\nExplain in simple terms why this provider was chosen based on the risk score.`;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 80,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const choices = (response.data as any).choices;
    return choices && choices[0] && choices[0].text ? choices[0].text.trim() : 'LLM summary unavailable.';
  } catch (err) {
    return 'LLM summary unavailable.';
  }
}

app.post('/charge', async (req: Request, res: Response) => {
  const { amount, currency, source, email } = req.body as ChargeRequest;
  if (!amount || !currency || !source || !email) {
    res.status(400).json({ error: 'Missing required fields.' });
    return;
  }

  const payload: ChargeRequest = { amount, currency, source, email };
  const riskScore = getFraudRiskScore(payload);
  const provider = routeProvider(riskScore);

  let status = 'success';
  if (provider === 'blocked') status = 'blocked';

  const explanation = await getLLMRiskSummary(payload, riskScore, provider);
  const transactionId = `txn_${Math.random().toString(36).substr(2, 8)}`;
  const timestamp = new Date().toISOString();

  const logEntry: TransactionLog = {
    transactionId,
    provider,
    status,
    riskScore,
    explanation,
    timestamp,
    metadata: payload
  };
  transactions.push(logEntry);

  if (provider === 'blocked') {
    res.status(403).json({
      transactionId,
      provider: null,
      status: 'blocked',
      riskScore,
      explanation
    });
    return;
  }

  res.json({
    transactionId,
    provider,
    status,
    riskScore,
    explanation
  });
});

app.get('/transactions', (req: Request, res: Response) => {
  res.json(transactions);
});

app.get('/', (req: Request, res: Response) => {
  res.send('Payment Gateway Node.js Application is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 