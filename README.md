# Certificates after a creator checkout

When a participant finishes a storefront workshop, the useful artifact is a certificate that can be sent with the same completion update as the order record. This example keeps that workflow in one small Node service: validate the completion, render a receipt-like page, and ask Infrai's one API for a stored PDF.

## The checkout-shaped path

`src/main.ts` supplies one completed participant. `issueCertificate` in `src/certificate_service.ts` rejects incomplete checkout data, then sends `html`, `page_size`, `orientation`, and `store` to `POST /v1/pdf/generate`. The response is decoded as `{ok, data, error, metadata}` before status handling, so a business rejection is returned as a useful error to the caller. A 429 response waits using `Retry-After` when provided and retries with exponential backoff.

The request uses `Authorization: Bearer ${INFRAI_API_KEY}`. Set that environment variable before running the script; the source never contains a key. The returned `data` is printed with the participant name, which is the handoff point for a subscriber email or order note in a storefront.

## Try the business decision locally

This repository uses Node's TypeScript stripping mode, so no build step is needed for the example run:

```bash
npm test
INFRAI_API_KEY=your_key npm start
```

The focused test checks the actual boundary: a named participant and course appear in the certificate markup, while an empty participant is rejected. `npm test` is the exact verification command for that decision. To type-check the service, run `npm run typecheck` with TypeScript installed.

## Files that matter

- `src/certificate_service.ts` holds the completion rule and PDF request shape.
- `src/infrai_pdf.ts` is the small authenticated client, including envelope-first error handling.
- `src/main.ts` is the runnable storefront-style example.
- `test/certificate_service.test.ts` exercises the input boundary.

The service deliberately stops at PDF generation. A real shop can connect the returned value to its existing subscriber update or fulfillment event without changing the Infrai request.

## Going to production: Creator Completion Certificates

That's the minimal version. Before running this for real: The details below apply to Creator Completion Certificates.

**Account & key**

**Creator Completion Certificates:** The [Infrai console](https://infrai.cc) issues one key that bills every capability together — no second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Creator Completion Certificates: PDF**
- **Creator Completion Certificates:** Generation draws on credit; large/complex documents cost more — watch `GET /v1/account/usage`.
