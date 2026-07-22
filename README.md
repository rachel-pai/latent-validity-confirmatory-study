# GitHub Pages + Firebase + Prolific deployment

This static study reads PROLIFIC_PID, STUDY_ID and SESSION_ID from the URL,
signs the participant into Firebase anonymously, atomically claims one of 48
server-seeded assignments, saves 24 responses, and redirects to Prolific.

## Researcher steps

1. In Firebase Authentication enable Anonymous sign-in and create Firestore.
2. Merge firestore.rules into the existing project rules; do not overwrite
   rules for other studies.
3. Put the 48 frozen assignment CSVs in ignored seed_input/.
   Build them from a private 144-row master with:
   python3 scripts/build_assignments.py MASTER.csv --output seed_input
   The script requires 12 two-sided pairs for each of requester, purpose,
   revision, lifecycle, provenance and reference, and fails unless every item
   receives eight judgments with zero within-participant pair overlap.
4. Set GOOGLE_APPLICATION_CREDENTIALS to an Admin service account stored
   outside this repository, run npm install and npm run seed once.
5. Replace the completion code in firebase-config.js.
6. Push this directory to a new public GitHub repository and enable Pages from
   the main branch root.
7. Use this Prolific destination URL:

   https://OWNER.github.io/REPO/?PROLIFIC_PID={{%PROLIFIC_PID%}}&STUDY_ID={{%STUDY_ID%}}&SESSION_ID={{%SESSION_ID%}}

Recruit 3-5 cognitive-pilot participants first. After wording is frozen and
the preregistration is public, recruit 48 new formal participants. Pilot users
must not enter the formal study namespace.
