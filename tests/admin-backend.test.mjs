import assert from 'node:assert/strict';
import test from 'node:test';

process.env.APP_GUARD_SECRET = 'test-only-guard-secret-with-enough-entropy';
process.env.APP_ADMIN_PASSWORD = 'test-only-admin-password';
process.env.APP_ADMIN_LOGIN_MAX_ATTEMPTS = '3';

const api = await import('../lib/api-utils.js');
const { isValidIp } = await import('../lib/ip-blacklist.js');

function responseMock() {
  const headers = new Map();
  return {
    headers,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); }
  };
}

function requestMock(userAgent = 'Browser Test/1.0') {
  return {
    headers: { host: 'localhost:5173', 'user-agent': userAgent, 'x-forwarded-for': '127.0.0.1' },
    socket: { remoteAddress: '127.0.0.1' }
  };
}

test('admin cookie is signed and bound to the browser user-agent', () => {
  const req = requestMock();
  const res = responseMock();
  api.issueAdminCookie(req, res);
  const rawCookie = res.headers.get('set-cookie');
  assert.match(rawCookie, /HttpOnly/);
  assert.match(rawCookie, /SameSite=Strict/);
  const cookie = rawCookie.split(';')[0];
  assert.equal(api.verifyAdminCookie({ ...req, headers: { ...req.headers, cookie } }), true);
  const other = requestMock('Different Browser/2.0');
  assert.equal(api.verifyAdminCookie({ ...other, headers: { ...other.headers, cookie } }), false);
});

test('admin login rate limiter blocks repeated failures', () => {
  const req = requestMock('Rate Limit Test');
  assert.equal(api.adminLoginRateState(req).allowed, true);
  api.recordAdminLoginFailure(req);
  api.recordAdminLoginFailure(req);
  api.recordAdminLoginFailure(req);
  assert.equal(api.adminLoginRateState(req).allowed, false);
  api.clearAdminLoginFailures(req);
  assert.equal(api.adminLoginRateState(req).allowed, true);
});

test('IP validator accepts IPv4 and IPv6 and rejects malformed values', () => {
  assert.equal(isValidIp('192.168.0.1'), true);
  assert.equal(isValidIp('2001:db8::1'), true);
  assert.equal(isValidIp('999.10.10.10'), false);
  assert.equal(isValidIp('not-an-ip'), false);
});
