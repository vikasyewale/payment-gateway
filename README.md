# Payment Gateway Node.js Application

This is a lightweight Node.js + TypeScript backend that simulates a payment gateway proxy with fraud risk scoring and LLM-based risk explanations.

## Features
- POST `/charge`: Simulate a payment request, fraud scoring, and routing/blocking
- GET `/transactions`: View all logged transactions (in memory)
- LLM-generated human-readable risk explanations
- TypeScript, Jest unit tests, and modern structure

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set your OpenAI API key:**
   ```bash
   export OPENAI_API_KEY=sk-...   # or set in your environment
   ```

3. **Run the app:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## API Endpoints

### POST `/charge`
**Request Body:**
```json
{
  "amount": 1000,
  "currency": "USD",
  "source": "tok_test",
  "email": "donor@example.com"
}
```

**Behavior:**
- Simulates a fraud risk score (0-1) using heuristics (large amount, suspicious domain: `.ru`, `@test.com`)
- If score < 0.5: routes to provider ("paypal") and returns success
- If score ≥ 0.5: blocks the transaction
- Returns a natural-language risk explanation from an LLM
- Logs all transactions in memory

**Example Success Response:**
```json
{
  "transactionId": "txn_abc123",
  "provider": "paypal",
  "status": "success",
  "riskScore": 0.32,
  "explanation": "This payment was routed to PayPal due to a low risk score."
}
```

**Example Blocked Response:**
```json
{
  "transactionId": "txn_xyz789",
  "provider": null,
  "status": "blocked",
  "riskScore": 0.7,
  "explanation": "This payment was blocked due to a high risk score based on a suspicious email domain."
}
```

### GET `/transactions`
Returns all logged transactions (in memory):
```json
[
  {
    "transactionId": "txn_abc123",
    "provider": "paypal",
    "status": "success",
    "riskScore": 0.32,
    "explanation": "...",
    "timestamp": "2024-05-01T12:00:00.000Z",
    "metadata": {
      "amount": 1000,
      "currency": "USD",
      "source": "tok_test",
      "email": "donor@example.com"
    }
  }
]
```

## Project Structure
- `index.ts` - Main server entry point
- `fraud.ts` - Fraud scoring and routing logic
- `fraud.test.ts` - Unit tests for fraud logic

## License
MIT 