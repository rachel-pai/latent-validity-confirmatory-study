import admin from 'firebase-admin';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'..');
const studyId='lv-confirmatory-v1-20260722';
if(!process.env.GOOGLE_APPLICATION_CREDENTIALS)throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS to a local service-account JSON path. Never commit that file.');
admin.initializeApp({credential:admin.credential.applicationDefault(),projectId:'agentmemory-7e124'});
const db=admin.firestore();

function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'&&text[i+1]==='"'){field+='"';i++}else if(c==='"')quoted=false;else field+=c}else if(c==='"')quoted=true;else if(c===','){row.push(field);field=''}else if(c==='\n'){row.push(field.replace(/\r$/,''));rows.push(row);row=[];field=''}else field+=c}
  if(field||row.length){row.push(field);rows.push(row)}const head=rows.shift().map(x=>x.replace(/^\ufeff/,''));return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(head.map((h,i)=>[h,r[i]??''])));
}
const batchSize=400;let ops=[];
async function flush(){if(!ops.length)return;const batch=db.batch();for(const [ref,data] of ops)batch.set(ref,data);await batch.commit();ops=[]}
function put(ref,data){ops.push([ref,data]);if(ops.length>=batchSize)return flush()}

const studyRef=db.collection('studies').doc(studyId);
await put(studyRef,{studyId,interfaceVersion:'lv-confirmatory-github-pages-v1',status:'SEEDED_NOT_OPEN',slots:48,itemsPerSlot:24,createdAt:admin.firestore.FieldValue.serverTimestamp()});
for(let n=1;n<=48;n++){
  const slotId=`RATER_SLOT_${String(n).padStart(2,'0')}`,slotRef=studyRef.collection('slots').doc(slotId);
  await put(slotRef,{slotId,claimed:false,ownerUid:null,createdAt:admin.firestore.FieldValue.serverTimestamp()});
  const seedDir=process.env.LV_TASKS_DIR||path.join(root,'seed_input');
  const csvPath=path.join(seedDir,`${slotId}_TASKS.csv`);
  const rows=parseCsv(fs.readFileSync(csvPath,'utf8'));
  if(rows.length!==24)throw new Error(`${slotId}: expected 24 tasks, found ${rows.length}`);
  for(const [displayOrder,r] of rows.entries())await put(slotRef.collection('tasks').doc(r.task_id),{taskId:r.task_id,title:r.title,request:r.request,relevantHistory:r.relevant_history,decisionContext:r.decision_context,storedNoteA:r.stored_note_a,storedNoteB:r.stored_note_b,displayOrder});
}
await flush();console.log(`Seeded ${studyId}: 48 slots x 24 blind tasks. No pair or outcome metadata uploaded.`);
