# Requirements: Zwift Ride Fitting Assistant

**Defined:** 2026-03-21
**Core Value:** Given my existing bike measurements, tell me exactly how to set up my Zwift Ride to match — in both millimeters and Zwift Ride position letters.

## v1 Requirements

### Inputs — Physical Measurements

- [ ] **PHYS-01**: User can enter saddle height (from bottom bracket to top of saddle) with reference point shown
- [ ] **PHYS-02**: User can enter saddle setback (horizontal distance from BB center to saddle nose)
- [ ] **PHYS-03**: User can enter handlebar height (from floor or BB — reference point shown)
- [ ] **PHYS-04**: User can enter handlebar reach (horizontal distance from saddle nose to bar center)
- [ ] **PHYS-05**: User can enter handlebar drop (for drop bars — height difference between saddle and hoods)
- [ ] **PHYS-06**: User can enter crank length (for saddle height correction, since Zwift Ride uses 170mm cranks)
- [ ] **PHYS-07**: User can select handlebar type (drop bars vs flat bars) to trigger correct reach calculation

### Inputs — Frame Geometry

- [ ] **FRAME-01**: User can enter frame stack (BB center to top of head tube)
- [ ] **FRAME-02**: User can enter frame reach (BB center to top-center of head tube, horizontal)
- [ ] **FRAME-03**: User can enter seat tube length and angle

### Inputs — Body Measurements

- [ ] **BODY-01**: User can enter inseam length
- [ ] **BODY-02**: User can enter torso length
- [ ] **BODY-03**: User can enter arm length
- [ ] **BODY-04**: App derives estimated position targets from body measurements when direct measurements are absent

### Inputs — Bike Fit Report

- [ ] **FIT-01**: User can manually enter key values from a professional bike fit report (saddle height, setback, reach, drop)
- [ ] **FIT-02**: Fit report values take priority over derived/estimated values in the calculation engine

### Calculation Engine

- [ ] **CALC-01**: App calculates target Zwift Ride saddle height (mm) from input measurements, corrected for crank length difference
- [ ] **CALC-02**: App calculates target Zwift Ride saddle fore/aft position (mm) from input measurements
- [ ] **CALC-03**: App calculates target Zwift Ride handlebar height (mm) from input measurements
- [ ] **CALC-04**: App calculates target Zwift Ride handlebar reach (mm) from input measurements, accounting for handlebar type (drop vs flat)
- [x] **CALC-05**: App converts each mm target to the corresponding Zwift Ride letter position using the hardware lookup table
- [x] **CALC-06**: App applies priority order: fit report values > direct measurements > frame geometry derivations > body measurement estimations

### Output

- [ ] **OUT-01**: Output shows the target mm value for each of the 4 Zwift Ride adjustment axes
- [ ] **OUT-02**: Output shows the corresponding Zwift Ride letter position for each axis
- [ ] **OUT-03**: Output shows an out-of-range warning when a target falls outside the Zwift Ride's adjustment limits
- [ ] **OUT-04**: Output is presented as a step-by-step adjustment guide (in order: saddle height → saddle fore/aft → bar height → bar reach)
- [ ] **OUT-05**: Each output step includes a brief explanation of how to make the adjustment on the Zwift Ride

### UX & Persistence

- [ ] **UX-01**: Every measurement input field shows a reference point definition (e.g. "measure from center of BB axle to top of saddle")
- [ ] **UX-02**: All entered measurements are saved to browser localStorage and restored on next visit
- [ ] **UX-03**: App is mobile-responsive and usable on a phone next to the bike
- [ ] **UX-04**: User can clear/reset all saved measurements and start fresh

## v2 Requirements

### Profiles

- **PROF-01**: User can save and name multiple bike profiles
- **PROF-02**: User can switch between saved profiles
- **PROF-03**: User can compare two profiles side-by-side

### Sharing

- **SHARE-01**: User can copy the adjustment guide to clipboard as plain text
- **SHARE-02**: User can generate a shareable URL with their measurements encoded

### Body-Only Mode

- **BONLY-01**: User can get a Zwift Ride setup estimate using only body measurements (no bike required)

## Out of Scope

| Feature | Reason |
|---------|--------|
| PDF upload / parsing | Manual entry sufficient for v1; adds significant complexity |
| User accounts / login | localStorage covers persistence needs without a backend |
| Support for other smart trainers (Wahoo KICKR Bike, etc.) | Zwift Ride only — staying focused |
| AI-based fit assessment | Out of scope; this is a calculator, not a fitter |
| Angle-based inputs (seat angle degrees, torso angle) | Adds complexity; direct measurements are more accessible to typical users |
| Paid tier / subscription | Free service only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CALC-01 | Phase 1 | Pending |
| CALC-02 | Phase 1 | Pending |
| CALC-03 | Phase 1 | Pending |
| CALC-04 | Phase 1 | Pending |
| CALC-05 | Phase 1 | Complete |
| CALC-06 | Phase 1 | Complete |
| PHYS-01 | Phase 2 | Pending |
| PHYS-02 | Phase 2 | Pending |
| PHYS-03 | Phase 2 | Pending |
| PHYS-04 | Phase 2 | Pending |
| PHYS-05 | Phase 2 | Pending |
| PHYS-06 | Phase 2 | Pending |
| PHYS-07 | Phase 2 | Pending |
| FRAME-01 | Phase 2 | Pending |
| FRAME-02 | Phase 2 | Pending |
| FRAME-03 | Phase 2 | Pending |
| BODY-01 | Phase 2 | Pending |
| BODY-02 | Phase 2 | Pending |
| BODY-03 | Phase 2 | Pending |
| BODY-04 | Phase 2 | Pending |
| FIT-01 | Phase 2 | Pending |
| FIT-02 | Phase 2 | Pending |
| UX-01 | Phase 2 | Pending |
| UX-03 | Phase 2 | Pending |
| OUT-01 | Phase 3 | Pending |
| OUT-02 | Phase 3 | Pending |
| OUT-03 | Phase 3 | Pending |
| OUT-04 | Phase 3 | Pending |
| OUT-05 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-04 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 after roadmap creation*
