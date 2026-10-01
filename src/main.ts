import { issueCertificate, type Completion } from "./certificate_service.ts";

const sample: Completion = {
  participant: "Mina Chen",
  course: "Storefront launch lab",
  completedAt: "2026-09-07",
  email: "mina@example.com"
};

issueCertificate(sample)
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error: Error) => { console.error(error.message); process.exitCode = 1; });
