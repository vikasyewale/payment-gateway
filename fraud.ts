export interface ChargeRequest {
  amount: number;
  currency: string;
  source: string;
  email: string;
}

export function isSuspiciousDomain(email: string): boolean {
  return /(@test\.com$|\.ru$)/i.test(email);
}

export function getFraudRiskScore({ amount, email }: ChargeRequest): number {
  let score = 0;
  if (amount > 1000) score += 0.4;
  else if (amount > 500) score += 0.2;
  if (isSuspiciousDomain(email)) score += 0.5;
  return Math.min(score, 1);
}

export function routeProvider(riskScore: number): string {
  return riskScore < 0.5 ? 'paypal' : 'blocked';
} 