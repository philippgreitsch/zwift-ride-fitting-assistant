# Feature Research

**Domain:** Bike fitting calculator / indoor trainer position translation tool
**Researched:** 2026-03-21
**Confidence:** MEDIUM (Zwift Ride hardware specs partially confirmed; position-to-mm mapping requires empirical measurement or official data not yet publicly indexed)

---

## Zwift Ride Hardware Reference

This section documents what is known — and what remains uncertain — about the physical adjustment system, because the calculation logic depends on it entirely.

### Adjustment Points (HIGH confidence)

The Zwift Ride has four independently adjustable dimensions:

| Dimension | Adjustment Axis | Notes |
|-----------|----------------|-------|
| Saddle height | Vertical (up/down) | Seatpost slides in frame tube |
| Saddle fore/aft | Horizontal (forward/back) | Rail clamp on seatpost head |
| Handlebar height | Vertical (up/down) | Stem column slides vertically |
| Handlebar reach | Horizontal (forward/back) | Handlebar unit slides horizontally |

Saddle tilt is also adjustable but is not part of the position-replication problem for this tool.

### Physical Ranges (MEDIUM confidence — sourced from official product page, Cycling Weekly review, geometrygeeks.bike)

| Dimension | Min | Max | Measurement Reference |
|-----------|-----|-----|----------------------|
| Saddle height | 599 mm | 865 mm | Bottom bracket center to top of saddle |
| Handlebar height | 863 mm | 1024 mm | Floor to handlebar center |
| Saddle fore/aft | ~100 mm total range | — | Rail clamp; 20 mm seatpost setback; ~10 cm total range per forum reports |
| Handlebar reach | Not confirmed | — | Handlebar slides horizontally; total range unconfirmed |

Rider fit range: 152–198 cm (5'0" to 6'6").

### Position Marking System (HIGH confidence — multiple sources including Cycling Weekly review, Zwift support, forum discussions)

Each adjustable component is marked with a scale in centimeters labeled with letters (A, B, C, D, ...). The letters are physical engravings or markings on the seatpost and handlebar column. Zwift provides a fit card (included in box, also available online as a PDF) that maps rider height to a recommended letter for each of the four adjustment points.

Key characteristics:
- The adjustment is **continuous** (loosen a single M6 hex bolt, slide to any position, retighten) — not click-detent or stepped. The letters are reference marks, not discrete stops.
- The fit card only accounts for rider height, not inseam, torso length, femur length, or flexibility.
- There is no official published table mapping letter positions to millimeter measurements. This is the core data gap this app must solve.

### Position-to-Millimeter Mapping (LOW confidence — critical gap)

No official document maps Zwift Ride letter positions to mm measurements. The PDF bike fit guide distributed by Wahoo/Zwift contains a rider height chart but not a mm conversion table. Community research has not produced a complete mapping.

**What is derivable:**
- Saddle height: range is 599–865 mm = 266 mm total range. If letters A–Z are used (26 positions), spacing would be ~10.6 mm/letter. Actual letter count unknown.
- Handlebar height: range is 863–1024 mm = 161 mm total range.
- Saddle fore/aft: ~100 mm total range per forum user reports; seatpost has 20 mm setback built in.
- Handlebar reach: total range not confirmed in available sources.

**Implication for the app:** The mm-to-position mapping must be either (a) empirically measured by someone with the actual hardware and a tape measure, (b) crowdsourced from users who know their letter position and can measure their actual bike, or (c) derived from the geometry PDF on the Zwift product page (which forum posts confirm exists but which is not publicly indexed).

**This is the highest-risk knowledge gap in the project.**

### Comparable Data Point (MEDIUM confidence — from geometrygeeks.bike)

The geometrygeeks geometry database shows the following for the Zwift Smart Frame 2025:

| Measurement | Min | Max |
|-------------|-----|-----|
| Reach (BB to HT center, horizontal) | 426 mm | 566 mm |
| Stack (BB to HT center, vertical) | 660 mm | 700 mm |
| Saddle height | 554 mm | 995 mm |

Note: these min/max values represent the full range across all possible adjustment combinations, not a single position. They are frame geometry values, not absolute floor measurements.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Input: saddle height (mm) | Core bike fit measurement every cyclist knows | LOW | Standard measurement: BB center to top of saddle |
| Input: handlebar reach (mm) | Standard cockpit measurement from all fit reports | LOW | Horizontal distance from BB center to bar grip |
| Input: handlebar stack/height (mm) | Standard cockpit measurement | LOW | Vertical distance from BB center to bar grip |
| Input: saddle setback (mm) | Standard saddle position measurement | LOW | Horizontal distance from BB center to saddle BRP |
| Output: Zwift Ride position for each dimension | Core purpose of the tool | MEDIUM | Requires verified mm-to-letter mapping |
| Output: physical mm target for each Zwift Ride dimension | Users want to verify with tape measure | LOW | Matches input values or calculates equivalent |
| Step-by-step adjustment guide | Users need procedural output, not just numbers | LOW | Ordered list of what to do, in what sequence |
| Persistent state across sessions | Users don't want to re-enter measurements | LOW | Browser localStorage; already in requirements |
| Mobile-friendly layout | Most users will have phone next to their trainer | MEDIUM | Responsive design; users adjust bike while looking at phone |
| Input validation with clear error messages | Without this, bad inputs produce nonsense outputs | LOW | Numeric ranges, required fields |
| Clear unit labeling (mm throughout) | Avoids confusion between mm/cm/inches | LOW | Enforce one unit system; accept conversions optionally |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Multiple input modes | Accommodates fit report users AND self-measurers AND body-measurement-only users | MEDIUM | Three entry paths: (1) direct mm measurements, (2) bike geometry + component specs, (3) body measurements with formula-based calculation |
| Body measurement estimation | Users without a fit report can still get a starting position using inseam/torso/arm formulas | MEDIUM | LeMond, Hamley, or similar formulas for saddle height; reach estimation is less reliable |
| Zwift Ride physical range indicator | Shows whether the user's target position is within the bike's adjustment range | LOW | Flag positions outside 599–865 mm saddle height, etc. |
| Visual position diagram | Shows a side-view diagram of the bike with target positions indicated | HIGH | Nice to have, but not essential for v1 |
| Copy-to-clipboard output | Users can save or share their settings | LOW | One button, copies the output text |
| "How to measure" inline help | Shows measurement technique for each input field | MEDIUM | Expandable tooltips or a dedicated help section; reduces measurement errors |
| Comparison mode (before/after) | Shows difference between current Zwift Ride settings and new target | MEDIUM | Requires storing both current and target values |
| Saddle height formula explainer | Shows which formula was used and why | LOW | Transparency builds trust; shows the arithmetic |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| PDF / fit report upload and parse | "I have a PDF from my fitter" | PDF formats vary wildly across fitters; OCR is fragile; adds backend complexity; out of scope per PROJECT.md | Manual entry of key numbers; add a "which numbers to enter" guide |
| User accounts and login | "Save multiple bikes" | Backend requirement, privacy concerns, maintenance burden, no free tier; out of scope per PROJECT.md | localStorage covers single profile; defer multi-profile to v1.x |
| Multiple saved bike profiles | Power users want to compare bikes | Increases UI complexity significantly for edge case users in v1 | Single active profile; add profile switching only after validating core tool |
| AI / LLM-generated fit recommendations | "Tell me if my fit looks good" | Fit quality assessment requires video analysis or professional judgment; calculator cannot assess whether a position is correct, only replicate it | Stay in scope: replication only, not assessment |
| Real-time adjustment sync | "Update Zwift Ride settings via app" | Zwift Ride has no digital adjustment API; adjustments are purely mechanical | Output is a static guide; user adjusts manually |
| Generic bike fitting (non-Zwift) | "Can you also do Wahoo KICKR Bike?" | Each trainer has different ranges and position systems; scope creep; per PROJECT.md Zwift Ride only | Explicitly label as Zwift Ride only |
| Angle-based inputs (trunk angle, knee angle) | Professional fitters use angles | Requires knowing body segment lengths to convert to mm; adds complexity; most users don't have this data | Accept linear measurements (mm/cm) which are easier to self-measure and appear on fit reports |
| Crank length adjustment advice | Power users care about this | Zwift Ride has a fixed 170 mm crank; no adjustment possible; including this creates confusion | Mention fixed crank length as a limitation note |

---

## Feature Dependencies

```
[Saddle height input]
    └──required by──> [Saddle height output (Zwift Ride position)]
                          └──required by──> [Step-by-step guide]

[Handlebar stack/height input]
    └──required by──> [Handlebar height output (Zwift Ride position)]
                          └──required by──> [Step-by-step guide]

[Handlebar reach input]
    └──required by──> [Handlebar reach output (Zwift Ride position)]
                          └──required by──> [Step-by-step guide]

[Saddle setback input]
    └──required by──> [Saddle fore/aft output (Zwift Ride position)]
                          └──required by──> [Step-by-step guide]

[mm-to-letter position mapping data]
    └──required by──> ALL outputs

[Body measurements (inseam, torso, arm)]
    └──enables──> [Estimated mm measurements via formula]
                      └──feeds into──> [All outputs] (same path as direct mm input)

[Input validation]
    └──enhances──> [All inputs]

[Zwift Ride range indicator]
    └──enhances──> [All outputs] (requires knowing Zwift Ride physical ranges)

[localStorage persistence]
    └──enhances──> [All inputs] (saves values across sessions)
```

### Dependency Notes

- **mm-to-letter mapping data requires real-world measurement:** The calculation engine cannot be built without this data. It is the single most critical non-code prerequisite.
- **Body measurement mode feeds the same output path as direct measurement mode:** The formula layer is optional and additive; it outputs mm values that feed the same calculation as direct entry.
- **Step-by-step guide requires all four adjustment outputs:** Do not show the guide until all positions are calculated; partial output is confusing.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Input: direct mm/cm entry for saddle height, saddle setback, handlebar height, handlebar reach — why essential: these are the four measurable dimensions that map directly to the four adjustment points
- [ ] Output: Zwift Ride letter position for each of the four adjustment points — why essential: core purpose of the app
- [ ] Output: physical mm target for confirmation — why essential: users want to verify with tape measure
- [ ] Step-by-step adjustment guide — why essential: output must be actionable, not just numbers
- [ ] Out-of-range warning if target exceeds Zwift Ride adjustment limits — why essential: prevents users from attempting impossible setups
- [ ] localStorage persistence for all inputs — why essential: users return to the trainer multiple sessions
- [ ] Mobile-responsive layout — why essential: phone next to trainer is the primary use context
- [ ] Inline "how to measure" guidance for each field — why essential: reduces bad inputs that produce wrong outputs

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Body measurement input mode (inseam/torso/arm formulas) — add when: users without fit data request a starting point
- [ ] Multiple saved profiles — add when: households with more than one rider report friction
- [ ] Copy-to-clipboard output — add when: early users ask how to save their settings
- [ ] Comparison mode (current vs target) — add when: users want to track adjustments over time

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Visual side-view position diagram — defer because: significant frontend complexity for additive value; core tool works without it
- [ ] Manufacturer geometry input (stack + reach + component specs) — defer because: most users have mm measurements, not geometry data; adds complexity
- [ ] Fit report number guide (which numbers to use from common fitter reports) — defer because: manual guidance docs are sufficient initially

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Direct mm input for 4 dimensions | HIGH | LOW | P1 |
| Zwift Ride position output (letter + mm) | HIGH | MEDIUM | P1 |
| Step-by-step adjustment guide | HIGH | LOW | P1 |
| Out-of-range warning | HIGH | LOW | P1 |
| localStorage persistence | HIGH | LOW | P1 |
| Mobile-responsive layout | HIGH | MEDIUM | P1 |
| Inline measurement guidance | MEDIUM | LOW | P1 |
| Body measurement estimation mode | MEDIUM | MEDIUM | P2 |
| Copy-to-clipboard | LOW | LOW | P2 |
| Multiple profiles | MEDIUM | MEDIUM | P2 |
| Comparison mode | MEDIUM | MEDIUM | P2 |
| Visual position diagram | MEDIUM | HIGH | P3 |
| Manufacturer geometry input mode | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Existing Zwift Fit Tool (zwift-fit-tool.replit.app) | XY Bike Calc | Bike Geometry Calc | Our Approach |
|---------|----------------------------------------------|--------------|-------------------|--------------|
| Zwift Ride specific output | Yes (exists, exact implementation unclear) | No | No | Yes — primary differentiator |
| Direct mm input | Unknown | Yes | Yes | Yes |
| Body measurement estimation | Unknown | No | No | v1.x |
| Step-by-step guide | Unknown | No | No | Yes |
| Out-of-range warnings | Unknown | No | No | Yes |
| localStorage | Unknown | URL-based sharing | No | Yes |
| Mobile layout | Unknown | Desktop-focused | Desktop-focused | Yes |

Note: The existing Replit tool (zwift-fit-tool.replit.app) is a direct competitor. Its exact implementation could not be scraped. It should be manually reviewed before building to avoid duplication and to identify gaps worth filling.

---

## Zwift Ride Adjustment System: Open Research Questions

These questions must be answered before the calculation engine can be built. They are not blocking for frontend scaffolding but are blocking for correct output.

1. **What is the complete letter range?** Is it A–Z? A–P? Does it differ between saddle and handlebar components?
2. **What is the mm distance between consecutive letter positions?** This must be measured on physical hardware or sourced from the Zwift geometry PDF (which forum users confirm exists on the product page Tech Specs tab but is not publicly indexed).
3. **What is the total handlebar reach adjustment range in mm?**
4. **Is the saddle fore/aft adjustment truly ~100 mm total, or is the 35 mm rail clamp the primary adjustment (on top of the 20 mm seatpost setback)?**
5. **Does the letter system for handlebar height use the same letter spacing as saddle height, or are they independent scales?**

**Recommended approach:** Before building the calculation engine, the person who owns the Zwift Ride should (a) measure mm at every letter position for all four dimensions using a tape measure and level, or (b) locate and download the geometry PDF from the Zwift product page Tech Specs tab. This data becomes the core lookup table in the app.

---

## Sources

- [Adjusting Your Zwift Ride — Zwift Support](https://support.zwift.com/en_us/adjusting-your-zwift-ride-SyUBRM8A)
- [Zwift Ride Forum: Adjustment of bike in cm](https://forums.zwift.com/t/adjustment-of-bike-in-cm/646075)
- [Zwift Ride Forum: With Bike Fitting](https://forums.zwift.com/t/zwift-ride-with-bike-fitting/661745)
- [Zwift Ride Forum: Measurements](https://forums.zwift.com/t/zwift-ride-measurements-e/635899)
- [Zwift Ride Forum: Zero Offset / Setback](https://forums.zwift.com/t/zwift-ride-zero-offset/636502)
- [Zwift Ride Forum: Help Needed (sizing)](https://forums.zwift.com/t/help-needed-does-the-zwift-ride-fit-my-size/634344)
- [Zwift Ride Forum: Height Frame](https://forums.zwift.com/t/height-zwift-ride-frame/660370)
- [Wahoo/Zwift Official Bike Fit Guide PDF](https://www.wahoofitness.com/media/wysiwyg/cms/zwift/ride/zwift-ride_guide_bike-fit_a-1.pdf)
- [Geometry Details: Zwift Smart Frame 2025 — geometrygeeks.bike](https://geometrygeeks.bike/bike/zwift-smart-frame-2025/)
- [A Detailed Look at the Zwift Ride — Mountain Massif](https://www.mountainmassif.com/reviews/technical-hardware/a-detailed-look-at-the-zwift-ride/)
- [Zwift Ride Review — Cycling Weekly](https://www.cyclingweekly.com/reviews/bike-reviews/zwift-ride-review-the-ultimate-smart-bike-for-zwifties)
- [Existing Zwift Fit Calculator (competitor)](https://zwift-fit-tool.replit.app/)
- [Foundation Bike Fit: How to Use Your Bike Fit Measurements](https://foundation.fit/2022/12/01/how-to-use-your-bike-fit-measurements/)
- [XY Bike Calc](https://www.xybikecalc.com/)
- [Bike Geometry Calculator](https://www.bikegeocalc.com/)
- [MyVeloFit Bike Fit Calculator](https://www.myvelofit.com/resources/bike-fit-calculator/)

---
*Feature research for: Zwift Ride Fitting Assistant*
*Researched: 2026-03-21*
