// Password rules for new accounts (security review F-04).
// Checked on the SERVER in the sign-up action; the form also shows the
// minimum so people are not surprised.
export const MIN_PASSWORD_LENGTH = 10;

// The passwords attackers try first. Not a full breach list, but it
// blocks the obvious ones, including the old shared default.
const COMMON = new Set([
  "12345678", "123456789", "1234567890", "0123456789", "11111111",
  "00000000", "87654321", "password", "password1", "password12",
  "password123", "passw0rd", "qwerty123", "qwertyuiop", "1q2w3e4r",
  "iloveyou", "admin123", "admin1234", "welcome1", "welcome123",
  "letmein123", "abc12345", "abcd1234", "phinma123", "phinma2026",
  "dugtong123", "dugtongojt", "changeme", "changeme123",
]);

// Returns a plain-English problem, or null when the password is fine.
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  const lower = password.toLowerCase();
  if (COMMON.has(lower) || /^(.)\1+$/.test(password)) {
    return "That password is too common. Pick something harder to guess.";
  }
  if (/^\d+$/.test(password)) {
    return "Add some letters: a password of only numbers is easy to guess.";
  }
  const name = email.split("@")[0];
  if (name.length >= 4 && lower.includes(name)) {
    return "Your password should not contain your email name.";
  }
  return null;
}
