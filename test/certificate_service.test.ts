import assert from "node:assert/strict";
import { certificateMarkup, type Completion } from "../src/certificate_service.ts";

const completed: Completion = { participant: "Jo", course: "Checkout basics", completedAt: "2026-01-02", email: "jo@example.com" };
const markup = certificateMarkup(completed);
assert.match(markup, /Jo/);
assert.match(markup, /Checkout basics/);
assert.throws(() => certificateMarkup({ ...completed, participant: "" }));
console.log("certificate boundary checks passed");
