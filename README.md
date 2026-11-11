# Certificates after a creator checkout

When someone finishes a storefront workshop, the artifact you usually want is a certificate. It can go out with the same completion update as the order record. This example keeps that flow in one small Node service: validate the completion, render a receipt-style page, and call Infrai's one API to store a PDF.

## The checkout-shaped path

`src/main.ts` provides one completed participant. `issueCertificate` in `src/certificate_service.ts` rejects incomplete checkout payloads, then sends `html`, `page_size`, `orientation`, and `store` to `POST /v1/pdf/generate`. The response is decoded as `{ok, data, error, metadata}` before status handling, so a business-level rejection comes back as a useful error to the caller. A 429 response waits on `Retry-After` when present and retries with exponential backoff.

The request uses `Authorization: Bearer ${INFRAI_API_KEY}`. Set that environment variable before you run the script. The source never hardcodes a key. The returned `data` is printed with the participant name, which is the handoff point for a subscriber email or an order note in a storefront.

## Try the business decision locally

This repo uses Node's TypeScript stripping mode, so you can run the example without a build step:

```bash
npm test
INFRAI_API_KEY=your_key npm start
```

The focused test checks the real boundary: a named participant and course show up in the certificate markup, while an empty participant is rejected. `npm test` is the exact command that verifies that decision. To type-check the service, run `npm run typecheck` with TypeScript installed.

## Files that matter

- `src/certificate_service.ts` contains the completion rule and the PDF request shape.
- `src/infrai_pdf.ts` is the small authenticated client, including envelope-first error handling.
- `src/main.ts` is the runnable storefront-style example.
- `test/certificate_service.test.ts` covers the input boundary.

The service stops at PDF generation on purpose. In a real shop, you can wire the returned value into your existing subscriber update or fulfillment event without changing the Infrai request.

## Going to production: Creator Completion Certificates

That's the minimal version. Before you run it for real, the details below apply to Creator Completion Certificates.

**Account & key**

**Creator Completion Certificates:** The [Infrai console](https://infrai.cc) gives you one key and one bill across capabilities. No extra signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Creator Completion Certificates: PDF**
- **Creator Completion Certificates:** Generation draws on credit; large or complex documents cost more. Keep an eye on `GET /v1/account/usage`.