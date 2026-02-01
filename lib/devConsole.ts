const originalError = console.error;
const originalWarn = console.warn;
const patterns = [
  'net::ERR_ABORTED',
  'firebase_firestore.js',
  'Firestore/Listen',
  'Firestore/Write',
  'google-analytics.com/g/collect'
];
const shouldFilter = (args: any[]) => {
  try {
    const text = args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' ');
    return patterns.some(p => text.includes(p));
  } catch {
    return false;
  }
};
console.error = (...args: any[]) => {
  if (shouldFilter(args)) return;
  originalError(...args);
};
console.warn = (...args: any[]) => {
  if (shouldFilter(args)) return;
  originalWarn(...args);
};
