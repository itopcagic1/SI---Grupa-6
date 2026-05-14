const mockSend = jest.fn();

jest.mock('../../../src/config/mailer', () => ({
  send: mockSend,
}));

const { posaljiResetEmail } = require('../../../src/services/emailService');

describe('emailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('posaljiResetEmail poziva sgMail.send sa ispravnim parametrima', async () => {
    mockSend.mockResolvedValue({});

    await posaljiResetEmail('user@example.com', 'https://example.com/reset?token=abc123');

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        subject: 'Reset lozinke',
      })
    );
  });

  test('posaljiResetEmail sadrzi reset link u html-u', async () => {
    mockSend.mockResolvedValue({});
    const resetLink = 'https://example.com/reset?token=abc123';

    await posaljiResetEmail('user@example.com', resetLink);

    const poziv = mockSend.mock.calls[0][0];
    expect(poziv.html).toContain(resetLink);
  });

  test('posaljiResetEmail salje na ispravan email', async () => {
    mockSend.mockResolvedValue({});

    await posaljiResetEmail('test@gmail.com', 'https://example.com/reset?token=xyz');

    const poziv = mockSend.mock.calls[0][0];
    expect(poziv.to).toBe('test@gmail.com');
  });

  test('posaljiResetEmail propagira gresku ako sgMail.send baci exception', async () => {
    mockSend.mockRejectedValue(new Error('SendGrid greska'));

    await expect(
      posaljiResetEmail('user@example.com', 'https://example.com/reset?token=abc')
    ).rejects.toThrow('SendGrid greska');
  });

  test('posaljiResetEmail salje od ispravne adrese', async () => {
    mockSend.mockResolvedValue({});

    await posaljiResetEmail('user@example.com', 'https://example.com/reset?token=abc');

    const poziv = mockSend.mock.calls[0][0];
    expect(poziv.from).toContain('pisprojekat15@gmail.com');
  });
});