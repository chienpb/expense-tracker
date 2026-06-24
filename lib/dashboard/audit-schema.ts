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
      /**
       * One-line clerical reasoning for EVERY entry — the reason for the hold
       * (SUSPICIOUS) or the reason it passed (APPROVED). The visible ledger
       * shows it only on SUSPICIOUS rows; the loupe reveals it for all rows as
       * hidden provenance fine-print (the-loupe spec).
       */
      note: z.string(),
    }),
  ),
});

export type AuditStamp = {
  id: string;
  verdict: 'APPROVED' | 'SUSPICIOUS';
  note: string;
};
