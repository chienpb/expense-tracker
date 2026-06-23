import { z } from 'zod/v4';

/**
 * The Rubber-Stamp Auditor's output shape — shared by the streaming route
 * (`app/api/audit/route.ts`, `streamText` + `Output.object`) and the client
 * (`_ledger.tsx`, `useObject`). Kept free of server-only imports so the
 * client bundle can pull it in. One stamp per audited entry.
 */
export const auditSchema = z.object({
  stamps: z.array(
    z.object({
      id: z.string(),
      verdict: z.enum(['APPROVED', 'SUSPICIOUS']),
      /** Only on SUSPICIOUS — the reason for the hold. `null` for APPROVED. */
      note: z.string().nullable(),
    }),
  ),
});

export type AuditStamp = {
  id: string;
  verdict: 'APPROVED' | 'SUSPICIOUS';
  note: string | null;
};
