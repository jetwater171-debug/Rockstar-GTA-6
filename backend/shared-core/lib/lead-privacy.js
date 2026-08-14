function asObject(value) {
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function cleanText(value, maxLength = 160) {
    const text = String(value ?? '').trim();
    return text ? text.slice(0, maxLength) : '';
}

function finiteNumber(value, min = -Infinity, max = Infinity) {
    const number = Number(value);
    if (!Number.isFinite(number)) return null;
    return Math.min(max, Math.max(min, number));
}

function sanitizeQuizSummary(value) {
    const quiz = asObject(value);
    const summary = {};
    const score = finiteNumber(quiz.score, 0, 100000);
    const total = finiteNumber(quiz.total, 0, 100000);
    const durationMs = finiteNumber(quiz.durationMs, 0, 24 * 60 * 60 * 1000);
    const status = cleanText(quiz.status, 60);
    const startedAt = cleanText(quiz.startedAt, 40);
    const completedAt = cleanText(quiz.completedAt, 40);

    if (score !== null) summary.score = score;
    if (total !== null) summary.total = total;
    if (status) summary.status = status;
    if (startedAt) summary.startedAt = startedAt;
    if (completedAt) summary.completedAt = completedAt;
    if (durationMs !== null) summary.durationMs = durationMs;
    return summary;
}

function sanitizeDimension(value) {
    const source = asObject(value);
    const out = {};
    ['width', 'height', 'availWidth', 'availHeight'].forEach((key) => {
        const number = finiteNumber(source[key], 0, 100000);
        if (number !== null) out[key] = Math.round(number);
    });
    return out;
}

function sanitizeDeviceContext(value) {
    const source = asObject(value);
    const screen = sanitizeDimension(source.screen);
    const viewport = sanitizeDimension(source.viewport);
    const networkSource = asObject(source.network);
    const network = {};
    const effectiveType = cleanText(networkSource.effectiveType, 24);
    const downlink = finiteNumber(networkSource.downlink, 0, 100000);
    const rtt = finiteNumber(networkSource.rtt, 0, 1000000);
    if (effectiveType) network.effectiveType = effectiveType;
    if (downlink !== null) network.downlink = downlink;
    if (rtt !== null) network.rtt = Math.round(rtt);
    if (typeof networkSource.saveData === 'boolean') network.saveData = networkSource.saveData;

    const out = {};
    const textFields = {
        type: 24,
        platform: 100,
        platformVersion: 80,
        model: 120,
        browserBrand: 120,
        browserVersion: 80,
        timezone: 100,
        language: 40,
        orientation: 40
    };
    Object.entries(textFields).forEach(([key, maxLength]) => {
        const text = cleanText(source[key], maxLength);
        if (text) out[key] = text;
    });
    if (typeof source.mobile === 'boolean') out.mobile = source.mobile;
    if (Object.keys(screen).length) out.screen = screen;
    if (Object.keys(viewport).length) out.viewport = viewport;
    if (Object.keys(network).length) out.network = network;

    const pixelRatio = finiteNumber(source.pixelRatio, 0, 100);
    const touchPoints = finiteNumber(source.touchPoints, 0, 1000);
    if (pixelRatio !== null) out.pixelRatio = pixelRatio;
    if (touchPoints !== null) out.touchPoints = Math.round(touchPoints);
    if (Array.isArray(source.languages)) {
        out.languages = source.languages
            .map((item) => cleanText(item, 40))
            .filter(Boolean)
            .slice(0, 8);
    }
    return out;
}

function sanitizeLeadPayload(value) {
    const source = asObject(value);
    const out = { ...source };

    delete out.answers;
    delete out.quizAnswers;
    if (Object.prototype.hasOwnProperty.call(source, 'quiz')) {
        const quiz = sanitizeQuizSummary(source.quiz);
        if (Object.keys(quiz).length) out.quiz = quiz;
        else delete out.quiz;
    }
    if (Object.prototype.hasOwnProperty.call(source, 'device')) {
        const device = sanitizeDeviceContext(source.device);
        if (Object.keys(device).length) out.device = device;
        else delete out.device;
    }
    return out;
}

function browserFromUa(ua) {
    const rules = [
        [/edg(?:e|ios|a)?\/([\d.]+)/i, 'Microsoft Edge'],
        [/opr\/([\d.]+)/i, 'Opera'],
        [/samsungbrowser\/([\d.]+)/i, 'Samsung Internet'],
        [/crios\/([\d.]+)/i, 'Chrome'],
        [/chrome\/([\d.]+)/i, 'Chrome'],
        [/fxios\/([\d.]+)/i, 'Firefox'],
        [/firefox\/([\d.]+)/i, 'Firefox'],
        [/version\/([\d.]+).*safari/i, 'Safari']
    ];
    for (const [pattern, name] of rules) {
        const match = ua.match(pattern);
        if (match) return { name, version: match[1] || '' };
    }
    if (/; wv\).*version\//i.test(ua)) return { name: 'WebView Android', version: '' };
    return { name: ua ? 'Navegador não identificado' : 'Não informado', version: '' };
}

function osFromUa(ua, device = {}) {
    let match = ua.match(/android\s+([\d.]+)/i);
    if (match) return `Android ${match[1]}`;
    match = ua.match(/(?:iphone os|cpu (?:iphone )?os)\s+([\d_]+)/i);
    if (match) return `iOS ${match[1].replace(/_/g, '.')}`;
    match = ua.match(/windows nt\s+([\d.]+)/i);
    if (match) return 'Windows';
    match = ua.match(/mac os x\s+([\d_]+)/i);
    if (match) return `macOS ${match[1].replace(/_/g, '.')}`;
    if (/cros/i.test(ua)) return 'ChromeOS';
    if (/linux/i.test(ua)) return 'Linux';
    const platform = cleanText(device.platform, 100);
    return platform || 'Não informado';
}

function androidModelFromUa(ua) {
    const match = ua.match(/android[^;)]*;\s*(?:[a-z-]+(?:_[a-z-]+)?;\s*)?([^;)]+?)(?:\s+build\/|;\s*wv\)|\))/i);
    if (!match) return '';
    return cleanText(match[1].replace(/\s+wv$/i, ''), 120);
}

function describeLeadDevice(userAgent, deviceValue = {}) {
    const ua = cleanText(userAgent, 500);
    const device = sanitizeDeviceContext(deviceValue);
    const browser = browserFromUa(ua);
    const isIpad = /ipad/i.test(ua);
    const isIphone = /iphone/i.test(ua);
    const isAndroid = /android/i.test(ua);
    const isTablet = isIpad || /tablet|silk|kindle|playbook/i.test(ua) || (isAndroid && !/mobile/i.test(ua));
    const isMobile = device.mobile === true || isIphone || (isAndroid && /mobile/i.test(ua));
    const type = cleanText(device.type, 24) || (isTablet ? 'Tablet' : isMobile ? 'Celular' : 'Desktop');
    const suppliedModel = cleanText(device.model, 120);
    const model = suppliedModel || (isIphone ? 'iPhone' : isIpad ? 'iPad' : isAndroid ? androidModelFromUa(ua) || 'Android' : type);
    const os = osFromUa(ua, device);
    const browserName = cleanText(device.browserBrand, 120) || browser.name;
    const browserVersion = cleanText(device.browserVersion, 80) || browser.version;
    const summary = [model || type, os, browserName].filter(Boolean).join(' · ');

    return {
        ...device,
        type,
        mobile: isMobile || isTablet,
        model,
        os,
        browser: browserName,
        browserVersion,
        summary,
        userAgent: ua
    };
}

module.exports = {
    describeLeadDevice,
    sanitizeDeviceContext,
    sanitizeLeadPayload,
    sanitizeQuizSummary
};
