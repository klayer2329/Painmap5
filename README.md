# Basketball Foot & Ankle Injury Screening System

A dependency-free HTML/CSS/JavaScript screening tool for basketball athletes ages 12–18. It is not a medical diagnosis and does not replace clinical examination or imaging.

## Run

Open `index.html` directly, or serve the folder locally:

```bash
python3 -m http.server 8080
```

## Flow

Warning-sign checklist → pain VAS → acute/overuse questionnaire → image-based pain-location selection → additional questions → functional tests → score breakdown → special tests → Top 3 results and rehabilitation guidance.

## Current behavior

- The warning-sign checklist comes before the pain VAS. The urgent-stop decision is evaluated after both screens are complete.
- The injury-history screen, state, and score multiplier have been removed.
- Seven illustrated region cards replace the old view-tab/hotspot selector; exact location, shape, and depth follow.
- Each condition's normalized base score is 40% location match and 60% other questionnaire features. Global rules, urgent overrides, and special-test adjustments are applied afterward.
- Achilles tendon rupture participates normally in acute Top 3 ranking.
- User-visible questions, controls, score explanations, test guidance, rehabilitation guidance, results, and documentation are presented in English. Internal answer tokens remain compatible with the source clinical rules.

Key files: `js/app.js` (flow), `js/engine/scoring.js` (scoring), `js/painmap.js` (image cards), `js/en.js` (English presentation layer), and `js/data/` (clinical data).

## Optional online data collection

The screening can anonymously store every choice and final result in Supabase. A protected, read-only `admin.html` dashboard supports filtering, record details, and CSV export. See [`DATA_COLLECTION_SETUP.md`](DATA_COLLECTION_SETUP.md) and [`supabase/setup.sql`](supabase/setup.sql).
