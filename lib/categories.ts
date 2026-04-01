export const CATEGORIES = {
  'Food & Drink': ['groceries', 'restaurant', 'coffee', 'delivery'],
  Transport: ['grab', 'fuel', 'parking', 'toll', 'public transit'],
  Shopping: ['clothes', 'gadgets', 'random stuff'],
  'Personal Care': ['haircut', 'skincare', 'spa'],
  Entertainment: ['games', 'streaming', 'events', 'concerts'],
  Health: ['pharmacy', 'gym', 'clinic'],
  'Bills & Utilities': ['phone', 'internet', 'electricity'],
  Travel: ['flights', 'hotels', 'activities'],
  Other: [],
} as const;

export function categoriesPrompt(): string {
  return Object.entries(CATEGORIES)
    .map(([cat, subs]) =>
      subs.length > 0 ? `- ${cat}: ${subs.join(', ')}` : `- ${cat}: (catch-all)`
    )
    .join('\n');
}
