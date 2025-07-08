import { isSuspiciousDomain, getFraudRiskScore, routeProvider, ChargeRequest } from './fraud';

describe('Fraud Logic', () => {
  describe('isSuspiciousDomain', () => {
    it('detects .ru domains', () => {
      expect(isSuspiciousDomain('user@site.ru')).toBe(true);
    });
    it('detects test.com domains', () => {
      expect(isSuspiciousDomain('user@test.com')).toBe(true);
    });
    it('does not flag normal domains', () => {
      expect(isSuspiciousDomain('user@example.com')).toBe(false);
    });
  });

  describe('getFraudRiskScore', () => {
    it('returns high score for large amount and suspicious domain', () => {
      const req: ChargeRequest = { amount: 2000, currency: 'USD', source: 'tok', email: 'a@b.ru' };
      expect(getFraudRiskScore(req)).toBe(0.9);
    });
    it('returns medium score for medium amount', () => {
      const req: ChargeRequest = { amount: 700, currency: 'USD', source: 'tok', email: 'a@b.com' };
      expect(getFraudRiskScore(req)).toBe(0.2);
    });
    it('returns low score for small amount and normal domain', () => {
      const req: ChargeRequest = { amount: 100, currency: 'USD', source: 'tok', email: 'a@b.com' };
      expect(getFraudRiskScore(req)).toBe(0);
    });
  });

  describe('routeProvider', () => {
    it('routes to paypal for low risk', () => {
      expect(routeProvider(0.2)).toBe('paypal');
    });
    it('blocks for high risk', () => {
      expect(routeProvider(0.7)).toBe('blocked');
    });
  });
}); 