# Safety routing update — 2026-09-28

Purpose: clarify current versus historical symptoms before a safety referral. This is a product implementation informed by general public guidance, not a validated diagnostic or triage instrument. Team-clinician review and prospective evaluation are still needed. It does not implement the Ottawa ankle rules or rule out fractures.

## Routing

- Immediate care: cold/discoloured foot or heavy bleeding; a new post-injury deformity (or uncertain new deformity); new ongoing post-injury sensory symptoms/weakness, or uncertainty about these symptoms.
- Prompt assessment: inability to bear weight/walk a few steps, current severe pain including episode VAS >= 8, current night waking, ongoing sensory symptoms, recently resolved sensory symptoms in a current episode, progressive shape changes, fever/chills with local symptoms, or specified uncertainty.
- Continue: only resolved historical symptoms, unchanged longstanding foot shape, or walking pain without reported inability to walk, provided no other referral criteria apply. Continuing is not clearance for sport or exclusion of serious injury.
- Context never overrides an active danger sign. Incomplete selected red-flag follow-ups conservatively refer in the explorer; the questionnaire requires answers before normal continuation. Certain immediate findings short-circuit to advice.
- All current night waking remains on the assessment branch pending clinical review; touching/turning at night does not automatically dismiss it.

## User flow

Context -> current safety checks -> explicit pain selection -> relevant follow-ups -> safety guidance. Referral routes skip physical tests and diagnosis ranking, permit returning to correct answers, and offer optional symptom summaries. Historical-only users may finish with a summary without testing. New text is bilingual.

## Records

Existing database outcome constraints are retained. Both referral tiers use `emergency_stop`; distinguish them with `answers.safety_triage.level`, `.reasons` and `.version`. `emergency` remains true for both tiers for legacy compatibility, not as a claim that all referrals are emergencies. Summary-only historical records use `no_candidate` with `answers.safety_summary_only=true`, not a scored negative result.

Safety referrals are saved only after the user chooses Finish or generates a summary, and only with prior anonymous-storage consent. Merely viewing advice or correcting answers does not create a record. Abandonments at that point are not counted. Existing records are unchanged; this version's rates cannot be directly compared with old auto-saved stops. Free-text summary fields are optional, capped at 500 characters each and escaped for display. Users are told not to include identifying details.

## Guidance consulted

- NHS, Sprains and strains: https://www.nhs.uk/conditions/sprains-and-strains/ (accessed 2026-09-28).
- NICE NG38, Recommendation 1.2.2: https://www.nice.org.uk/guidance/ng38/chapter/Recommendations (Ottawa rules are a clinical imaging decision aid; not reproduced as a self-test here).

## Verification

`tests/triage.test.cjs`: scenario routing, emergency priority, current danger in historical context, form requirements, return/edit, longstanding foot shape, escaped summary, consent and bilingual rendering.
`tests/logic-tree.test.cjs`: shared safety logic plus existing 69 location paths, 10 coverage gaps, scores, special tests and admin navigation.
