# Pilot v2 stimulus audit

Frozen candidate: `lv-confirmatory-cognitive-pilot-v2-20260722`

## Design checks

- 24 items: four for each of requester, purpose, revision, lifecycle, provenance, and reference.
- Two admissible and two blocked/unresolved cases per factor.
- 24 unique titles, requests, histories, decision contexts, highlighted details, and additional records.
- No participant sees a repeated entity or a second version of the same scenario.
- Each case supplies concrete evidence needed for the intended judgment.
- Authorization, revision, source, and reference evidence is expressed through ordinary records and roles rather than abstract construction metadata.
- Public stimuli contain no `factor`, `condition`, `pair_id`, or expected-answer fields.
- The private analysis key is stored outside this public site repository at `../pilot-v2-private-key.csv` and is never loaded by the participant page.

## Interpretation safeguards

- Requester and purpose blocks should produce `no` judgments.
- Unsupported provenance and ambiguous-reference cases should produce `unresolved`, not forced denials.
- Revision cases distinguish a superseded remembered value from a currently supported one.
- Lifecycle cases hold factual currency constant while changing whether the authorization remains active.

## Freeze rule

Do not edit wording after recruitment begins if pilot responses may be retained in the confirmatory sample. Any construct-relevant edit requires a new study ID and interface version.
