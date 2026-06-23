import { streamText, Output } from 'ai';
import { openai } from '@ai-sdk/openai';
import { auditSchema } from '@/lib/dashboard/audit-schema';
import { getUnauditedBatch, auditTask, persistVerdicts } from '@/lib/dashboard/audit';
import { ledgerKeeperInstructions } from '@/lib/ledger-keeper-prompt';

/**
 * `POST /api/audit` — stream the Rubber-Stamp Auditor's verdicts for a month.
 *
 * Body: `{ month: 'YYYY-MM-01' }`. Finds the month's unaudited entries, runs
 * ONE model call, and streams `{ stamps: [...] }` as it generates so the
 * client (`_ledger.tsx` via `useObject`) stamps rows one by one. The complete
 * output is persisted server-side (`result.output`) — the stream is tee'd, so
 * the client and the persist step read the same generation. A later view finds
 * nothing unaudited and never calls this route (generate-once/replay).
 *
 * Auth is the session cookie via `middleware.ts` (same-origin dashboard call);
 * no re-check here per invariant.
 */
export const maxDuration = 30;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { month?: string } | null;
  const month = String(body?.month ?? '').trim();
  if (!/^\d{4}-\d{2}-01$/.test(month)) {
    return Response.json(
      { error: 'month must be a first-of-month date (YYYY-MM-01)' },
      { status: 400 },
    );
  }

  const batch = await getUnauditedBatch(month);
  if (!batch) {
    // Nothing unaudited — hand back an empty, well-formed object so the
    // client's parser closes cleanly with no stamps.
    return new Response('{"stamps":[]}', {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const result = streamText({
    model: openai('gpt-5.4'),
    output: Output.object({ schema: auditSchema }),
    system: ledgerKeeperInstructions(auditTask(batch)),
    prompt: `Audit the ${batch.entries.length} unaudited ${batch.entries.length === 1 ? 'entry' : 'entries'} above.`,
  });

  // Persist the complete verdicts once generation finishes. The stream is
  // tee'd, so awaiting `output` here doesn't starve the client's reader. On a
  // model failure this rejects and we leave verdicts null (rows un-stamped).
  result.output.then(
    (o) => persistVerdicts(o.stamps),
    () => {},
  );

  return result.toTextStreamResponse();
}
