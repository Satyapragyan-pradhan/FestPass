const { generateEd25519KeyPair, signTicket, verifyTicket, parseToken } = require('../src/tokens');

describe('Ticket Tokens (Ed25519)', () => {
  const { publicKey, privateKey } = generateEd25519KeyPair();

  it('generates a valid Ed25519 keypair', () => {
    expect(publicKey).toContain('BEGIN PUBLIC KEY');
    expect(privateKey).toContain('BEGIN PRIVATE KEY');
  });

  it('signs ticket and creates format FP1.<ticketId>.<eventId>.<signatureBase64url>', () => {
    const token = signTicket({
      ticketId: '987654321012345678',
      eventId: 'evt_techfest_2026',
      privateKey,
    });

    expect(typeof token).toBe('string');
    const parts = token.split('.');
    expect(parts.length).toBe(4);
    expect(parts[0]).toBe('FP1');
    expect(parts[1]).toBe('987654321012345678');
    expect(parts[2]).toBe('evt_techfest_2026');
    expect(parts[3].length).toBeGreaterThan(20);
  });

  it('verifies valid signed token successfully', () => {
    const ticketId = '1001';
    const eventId = 'fest-2026';
    const token = signTicket({ ticketId, eventId, privateKey });

    const result = verifyTicket({ token, publicKey });
    expect(result.valid).toBe(true);
    expect(result.ticketId).toBe(ticketId);
    expect(result.eventId).toBe(eventId);
    expect(result.error).toBeUndefined();
  });

  it('rejects tampered ticketId', () => {
    const token = signTicket({ ticketId: '1001', eventId: 'fest-2026', privateKey });
    const parts = token.split('.');
    parts[1] = '1002'; // Tamper ticketId
    const tampered = parts.join('.');

    const result = verifyTicket({ token: tampered, publicKey });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('verification failed');
  });

  it('rejects tampered eventId', () => {
    const token = signTicket({ ticketId: '1001', eventId: 'fest-2026', privateKey });
    const parts = token.split('.');
    parts[2] = 'other-fest'; // Tamper eventId
    const tampered = parts.join('.');

    const result = verifyTicket({ token: tampered, publicKey });
    expect(result.valid).toBe(false);
    expect(result.error).toContain('verification failed');
  });

  it('rejects tampered signature bytes', () => {
    const token = signTicket({ ticketId: '1001', eventId: 'fest-2026', privateKey });
    const parts = token.split('.');
    // Flip a character in signature
    parts[3] = (parts[3].startsWith('A') ? 'B' : 'A') + parts[3].slice(1);
    const tampered = parts.join('.');

    const result = verifyTicket({ token: tampered, publicKey });
    expect(result.valid).toBe(false);
  });

  it('rejects token signed by different keypair', () => {
    const otherPair = generateEd25519KeyPair();
    const token = signTicket({
      ticketId: '1001',
      eventId: 'fest-2026',
      privateKey: otherPair.privateKey,
    });

    const result = verifyTicket({ token, publicKey }); // verified with original publicKey
    expect(result.valid).toBe(false);
  });

  it('parseToken extracts token parts correctly', () => {
    const token = 'FP1.ticket123.event456.sigABC';
    const parsed = parseToken(token);
    expect(parsed).toEqual({
      prefix: 'FP1',
      ticketId: 'ticket123',
      eventId: 'event456',
      signature: 'sigABC',
    });
  });
});
