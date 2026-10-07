# Care module (2026-10-07)

Entry: care.html. Independent recovery and urgent-care routes. The screening page and personal account link here without changing screening scoring or submitting research data.

- Recovery: pre-game, post-training and gym. Text-only named media placeholders; expandable precautions and difficulty notes.
- Current release is a content browser, not automated diagnosis-to-treatment assignment. No claim that a screening result grants exercise clearance.
- Advanced jumps, taping, band direction training and contrast require existing instruction. No automatic timer or auto-unlock for these items.
- Heat/ice timers pause at 5 minutes for skin checks; switching pages cancels timers. Elapsed time uses the clock, not interval count.
- Feedback stays only in page memory and explicitly says it is not account/cloud history. No new data tables, authentication or access policy changes.
- Urgent checks have yes/no/uncertain answers. Any first-five positive -> immediate help. Inability to bear weight or uncertainty -> medical assessment. Negative checks do not claim to rule out fracture.

Content is based on the owner's 康复板块！.pdf, excluding basic settings, with shortened steps and visible safety routing. Supporting sources: AAOS foot-and-ankle conditioning; NHS Gloucestershire ice/heat guidance; St John Ambulance bandaging and fracture guidance. The exact proposed advanced exercise variants require professional demonstration, and do not inherit general ankle-sprain protocol eligibility.

Validation: care.test.cjs covers triage routing, catalog scope and timers/feedback/navigation using a DOM harness; existing screening/account tests remain unchanged.
