export function authorize(request: Request): boolean {
  const auth = request.headers.get('Authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return token === process.env.EXPENSE_SECRET;
}
