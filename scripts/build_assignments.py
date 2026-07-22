#!/usr/bin/env python3
"""Build 48 blind, exactly balanced Prolific assignments.

Input master CSV columns:
item_id,pair_id,intervention,side,title,request,relevant_history,
decision_context,stored_note_a,stored_note_b
"""
import argparse,csv,json,random
from collections import Counter,defaultdict
from pathlib import Path

FACTORS=("requester","purpose","revision","lifecycle","provenance","reference")
PUBLIC=("task_id","title","request","relevant_history","decision_context","stored_note_a","stored_note_b")

def main():
 ap=argparse.ArgumentParser();ap.add_argument("master",type=Path)
 ap.add_argument("--output",type=Path,default=Path("seed_input"))
 ap.add_argument("--seed",type=int,default=20260722);a=ap.parse_args()
 with a.master.open(encoding="utf-8-sig",newline="") as f: rows=list(csv.DictReader(f))
 need={"item_id","pair_id","intervention","side",*PUBLIC[1:]}
 if len(rows)!=144 or not need.issubset(rows[0]):raise SystemExit("master must contain 144 rows and required columns")
 byf=defaultdict(list)
 for r in rows:
  if r["intervention"] not in FACTORS or r["side"] not in {"permitted","blocked"}:raise SystemExit("invalid metadata")
  byf[r["intervention"]].append(r)
 for f in FACTORS:
  z=byf[f]
  if len(z)!=24 or len({r["pair_id"] for r in z})!=12 or any(Counter(r["pair_id"] for r in z)[p]!=2 for p in {r["pair_id"] for r in z}):
   raise SystemExit(f"{f}: require 12 two-sided pairs")
 rng=random.Random(a.seed); assignments=[[] for _ in range(48)]
 for fi,factor in enumerate(FACTORS):
  pairs=sorted({r["pair_id"] for r in byf[factor]})
  lookup={(r["pair_id"],r["side"]):r for r in byf[factor]};seen=Counter()
  for i in range(48):
   chosen=[pairs[(i+fi+off)%12] for off in (0,3,6,9)]
   for pair in chosen:
    side="permitted" if seen[pair]<8 else "blocked"
    assignments[i].append(lookup[(pair,side)]);seen[pair]+=1
  if any(v!=16 for v in seen.values()):raise SystemExit(f"bad exposure count for {factor}")
 a.output.mkdir(parents=True,exist_ok=True)
 public_counts=Counter()
 for i,z in enumerate(assignments,1):
  rng.shuffle(z); path=a.output/f"RATER_SLOT_{i:02d}_TASKS.csv"
  with path.open("w",encoding="utf-8-sig",newline="") as f:
   w=csv.DictWriter(f,fieldnames=PUBLIC);w.writeheader()
   for r in z:
    out={k:r[k] for k in PUBLIC[1:]};out["task_id"]=r["item_id"];w.writerow(out);public_counts[r["item_id"]]+=1
 audit={"slots":48,"items_per_slot":24,"judgments":1152,
        "all_items_eight_judgments":all(v==8 for v in public_counts.values()),
        "within_slot_pair_overlap":max(24-len({r["pair_id"] for r in z}) for z in assignments),
        "factor_counts_per_slot":sorted({tuple(sorted(Counter(r["intervention"] for r in z).items())) for z in assignments})}
 (a.output/"assignment_audit.json").write_text(json.dumps(audit,indent=2)+"\n")
 if not audit["all_items_eight_judgments"] or audit["within_slot_pair_overlap"]!=0:raise SystemExit("assignment audit failed")
 print(json.dumps(audit,indent=2))
if __name__=="__main__":main()
