import admin from 'firebase-admin';
import fs from 'node:fs';
const studyId='lv-confirmatory-formal-v4-20260722';
if(!process.env.GOOGLE_APPLICATION_CREDENTIALS)throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to the local service-account JSON path.');
admin.initializeApp({credential:admin.credential.applicationDefault(),projectId:'agentmemory-7e124'});const db=admin.firestore();
const out=[];const participants=await db.collection('studies').doc(studyId).collection('participants').get();
for(const p of participants.docs){const responses=await p.ref.collection('responses').get();for(const r of responses.docs){const x=r.data();out.push({participant_uid:p.id,participant_id:p.data().prolificId||'',slot_id:p.data().slotId||'',completed:p.data().completed||false,...x,serverSavedAt:x.serverSavedAt?.toDate?.().toISOString?.()||''})}}
fs.mkdirSync('exports',{recursive:true});fs.writeFileSync(`exports/${studyId}.json`,JSON.stringify(out,null,2));console.log(`Exported ${out.length} responses from ${participants.size} participants.`);
