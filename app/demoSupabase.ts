/* Guest demo database. Never contacts Supabase or changes real user data. */
import type { SupabaseClient } from '@supabase/supabase-js';
type Row=Record<string,unknown>;
const guest='00000000-0000-4000-8000-000000000001';
const alex='00000000-0000-4000-8000-000000000002';
const emma='00000000-0000-4000-8000-000000000003';
const daniel='00000000-0000-4000-8000-000000000004';
const sophie='00000000-0000-4000-8000-000000000005';
const now='2026-10-19T11:30:00.000Z';
const maya='00000000-0000-4000-8000-000000000006';
const oliver='00000000-0000-4000-8000-000000000007';
const priya='00000000-0000-4000-8000-000000000008';
const lucas='00000000-0000-4000-8000-000000000009';
const chloe='00000000-0000-4000-8000-000000000010';
const profile=(id:string,number:number,full_name:string,headline:string,bio:string)=>({id,member_number:number,member_code:'00-00-000'+number,full_name,headline,bio,email:'demo'+number+'@example.invalid',location:'Dublin, Ireland',avatar:'https://i.pravatar.cc/160?img='+([12,14,47,49,32,44,13,45,15,46][number-1]||12),projects:[{id:'project-'+number,title:number===1?'Guest Startup Project':headline.split(' · ')[1]||'Business Venture',role:'Founder',year:'2024',ongoing:true,description:'Illustrative business profile for Veylo guest mode.'}],created_at:now,is_verified:false});
const tables:Record<string,Row[]>={
 profiles:[profile(guest,1,'Guest Founder','Entrepreneur · Guest Preview','Exploring connections and building new ventures.'),profile(alex,2,'Alex Morgan','Founder · Apex Studio','Building tools for growing businesses.'),profile(emma,3,'Emma Collins','Creative Director · Collins Studio','Helping startups develop memorable brands.'),profile(daniel,4,'Daniel Brooks','Investor · Brooks Ventures','Backing ambitious early-stage teams.'),profile(sophie,5,'Sophie Reed','Project Lead · Northstar Digital','Digital product and project specialist.'),profile(maya,6,'Maya Patel','Founder · Bloom & Co','Building a sustainable gifting business.'),profile(oliver,7,'Oliver Hayes','Founder · Launchpad Labs','Helping early-stage teams launch faster.'),profile(priya,8,'Priya Shah','Marketing Strategist · Brightline','Helping ambitious startups find their first customers.'),profile(lucas,9,'Lucas Bennett','Product Designer · Forma','Designing useful products for growing teams.'),profile(chloe,10,'Chloe Walsh','Founder · Gatherly','Connecting independent businesses with local communities.')],
 follows:[{follower_id:guest,followed_id:alex}],
 network_posts:[{id:'demo-post-1',member_id:alex,content:'Building something new? Share your idea and meet people who can help bring it to life.',created_at:now},{id:'demo-post-2',member_id:emma,content:'Our design studio is looking to partner with founders launching their first business. What are you building?',created_at:'2026-10-18T15:00:00.000Z'}],
 network_post_likes:[{post_id:'demo-post-1',user_id:emma},{post_id:'demo-post-1',user_id:daniel},{post_id:'demo-post-1',user_id:sophie},{post_id:'demo-post-1',user_id:maya},{post_id:'demo-post-1',user_id:oliver},{post_id:'demo-post-2',user_id:daniel},{post_id:'demo-post-2',user_id:sophie},{post_id:'demo-post-2',user_id:maya},{post_id:'demo-post-2',user_id:oliver},{post_id:'demo-post-2',user_id:priya},{post_id:'demo-post-2',user_id:lucas},{post_id:'demo-post-3',user_id:sophie},{post_id:'demo-post-3',user_id:maya},{post_id:'demo-post-3',user_id:oliver},{post_id:'demo-post-3',user_id:priya},{post_id:'demo-post-3',user_id:lucas},{post_id:'demo-post-3',user_id:chloe},{post_id:'demo-post-3',user_id:guest},{post_id:'demo-post-4',user_id:maya},{post_id:'demo-post-4',user_id:oliver},{post_id:'demo-post-4',user_id:priya},{post_id:'demo-post-4',user_id:lucas},{post_id:'demo-post-4',user_id:chloe},{post_id:'demo-post-4',user_id:guest},{post_id:'demo-post-4',user_id:alex},{post_id:'demo-post-4',user_id:emma},{post_id:'demo-post-5',user_id:oliver},{post_id:'demo-post-5',user_id:priya},{post_id:'demo-post-5',user_id:lucas},{post_id:'demo-post-5',user_id:chloe},{post_id:'demo-post-5',user_id:guest},{post_id:'demo-post-5',user_id:alex},{post_id:'demo-post-5',user_id:emma},{post_id:'demo-post-5',user_id:daniel},{post_id:'demo-post-5',user_id:sophie},{post_id:'demo-post-6',user_id:priya},{post_id:'demo-post-6',user_id:lucas},{post_id:'demo-post-6',user_id:chloe},{post_id:'demo-post-6',user_id:guest},{post_id:'demo-post-7',user_id:lucas},{post_id:'demo-post-7',user_id:chloe},{post_id:'demo-post-7',user_id:guest},{post_id:'demo-post-7',user_id:alex},{post_id:'demo-post-7',user_id:emma},{post_id:'demo-post-8',user_id:chloe},{post_id:'demo-post-8',user_id:guest},{post_id:'demo-post-8',user_id:alex},{post_id:'demo-post-8',user_id:emma},{post_id:'demo-post-8',user_id:daniel},{post_id:'demo-post-8',user_id:sophie},{post_id:'demo-post-9',user_id:guest},{post_id:'demo-post-9',user_id:alex},{post_id:'demo-post-9',user_id:emma},{post_id:'demo-post-9',user_id:daniel},{post_id:'demo-post-9',user_id:sophie},{post_id:'demo-post-9',user_id:maya},{post_id:'demo-post-9',user_id:oliver},{post_id:'demo-post-10',user_id:alex},{post_id:'demo-post-10',user_id:emma},{post_id:'demo-post-10',user_id:daniel},{post_id:'demo-post-10',user_id:sophie},{post_id:'demo-post-10',user_id:maya},{post_id:'demo-post-10',user_id:oliver},{post_id:'demo-post-10',user_id:priya},{post_id:'demo-post-10',user_id:lucas},{post_id:'demo-post-11',user_id:emma},{post_id:'demo-post-11',user_id:daniel},{post_id:'demo-post-11',user_id:sophie},{post_id:'demo-post-11',user_id:maya},{post_id:'demo-post-11',user_id:oliver},{post_id:'demo-post-11',user_id:priya},{post_id:'demo-post-11',user_id:lucas},{post_id:'demo-post-11',user_id:chloe},{post_id:'demo-post-11',user_id:guest},{post_id:'demo-post-12',user_id:daniel},{post_id:'demo-post-12',user_id:sophie},{post_id:'demo-post-12',user_id:maya},{post_id:'demo-post-12',user_id:oliver},{post_id:'demo-post-13',user_id:sophie},{post_id:'demo-post-13',user_id:maya},{post_id:'demo-post-13',user_id:oliver},{post_id:'demo-post-13',user_id:priya},{post_id:'demo-post-13',user_id:lucas},{post_id:'demo-post-14',user_id:maya},{post_id:'demo-post-14',user_id:oliver},{post_id:'demo-post-14',user_id:priya},{post_id:'demo-post-14',user_id:lucas},{post_id:'demo-post-14',user_id:chloe},{post_id:'demo-post-14',user_id:guest}],
 network_post_saves:[],
 network_post_comments:[{id:'demo-comment-1-0',post_id:'demo-post-1',user_id:maya,content:"This is exactly what early-stage founders need.",created_at:now},{id:'demo-comment-1-1',post_id:'demo-post-1',user_id:oliver,content:"Love this perspective. Thanks for sharing!",created_at:now},{id:'demo-comment-1-2',post_id:'demo-post-1',user_id:priya,content:"Congratulations on the milestone!",created_at:now},{id:'demo-comment-2-0',post_id:'demo-post-2',user_id:oliver,content:"Love this perspective. Thanks for sharing!",created_at:now},{id:'demo-comment-2-1',post_id:'demo-post-2',user_id:priya,content:"Congratulations on the milestone!",created_at:now},{id:'demo-comment-2-2',post_id:'demo-post-2',user_id:sophie,content:"Would love to connect and learn more.",created_at:now},{id:'demo-comment-2-3',post_id:'demo-post-2',user_id:daniel,content:"Such a useful reminder for founders.",created_at:now},{id:'demo-comment-3-0',post_id:'demo-post-3',user_id:priya,content:"Congratulations on the milestone!",created_at:now},{id:'demo-comment-3-1',post_id:'demo-post-3',user_id:sophie,content:"Would love to connect and learn more.",created_at:now},{id:'demo-comment-4-0',post_id:'demo-post-4',user_id:sophie,content:"Would love to connect and learn more.",created_at:now},{id:'demo-comment-4-1',post_id:'demo-post-4',user_id:daniel,content:"Such a useful reminder for founders.",created_at:now},{id:'demo-comment-4-2',post_id:'demo-post-4',user_id:chloe,content:"Really interesting. Keep us updated!",created_at:now},{id:'demo-comment-5-0',post_id:'demo-post-5',user_id:daniel,content:"Such a useful reminder for founders.",created_at:now},{id:'demo-comment-5-1',post_id:'demo-post-5',user_id:chloe,content:"Really interesting. Keep us updated!",created_at:now},{id:'demo-comment-5-2',post_id:'demo-post-5',user_id:lucas,content:"We have been thinking about this too.",created_at:now},{id:'demo-comment-5-3',post_id:'demo-post-5',user_id:alex,content:"Great work! Excited to follow your progress.",created_at:now},{id:'demo-comment-6-0',post_id:'demo-post-6',user_id:chloe,content:"Really interesting. Keep us updated!",created_at:now},{id:'demo-comment-6-1',post_id:'demo-post-6',user_id:lucas,content:"We have been thinking about this too.",created_at:now},{id:'demo-comment-7-0',post_id:'demo-post-7',user_id:lucas,content:"We have been thinking about this too.",created_at:now},{id:'demo-comment-7-1',post_id:'demo-post-7',user_id:alex,content:"Great work! Excited to follow your progress.",created_at:now},{id:'demo-comment-7-2',post_id:'demo-post-7',user_id:emma,content:"This is exactly what early-stage founders need.",created_at:now},{id:'demo-comment-8-0',post_id:'demo-post-8',user_id:alex,content:"Great work! Excited to follow your progress.",created_at:now},{id:'demo-comment-8-1',post_id:'demo-post-8',user_id:emma,content:"This is exactly what early-stage founders need.",created_at:now},{id:'demo-comment-8-2',post_id:'demo-post-8',user_id:maya,content:"Love this perspective. Thanks for sharing!",created_at:now},{id:'demo-comment-8-3',post_id:'demo-post-8',user_id:oliver,content:"Congratulations on the milestone!",created_at:now},{id:'demo-comment-9-0',post_id:'demo-post-9',user_id:emma,content:"This is exactly what early-stage founders need.",created_at:now},{id:'demo-comment-9-1',post_id:'demo-post-9',user_id:maya,content:"Love this perspective. Thanks for sharing!",created_at:now},{id:'demo-comment-10-0',post_id:'demo-post-10',user_id:maya,content:"Love this perspective. Thanks for sharing!",created_at:now},{id:'demo-comment-10-1',post_id:'demo-post-10',user_id:oliver,content:"Congratulations on the milestone!",created_at:now},{id:'demo-comment-10-2',post_id:'demo-post-10',user_id:priya,content:"Would love to connect and learn more.",created_at:now},{id:'demo-comment-11-0',post_id:'demo-post-11',user_id:oliver,content:"Congratulations on the milestone!",created_at:now},{id:'demo-comment-11-1',post_id:'demo-post-11',user_id:priya,content:"Would love to connect and learn more.",created_at:now},{id:'demo-comment-11-2',post_id:'demo-post-11',user_id:sophie,content:"Such a useful reminder for founders.",created_at:now},{id:'demo-comment-11-3',post_id:'demo-post-11',user_id:daniel,content:"Really interesting. Keep us updated!",created_at:now},{id:'demo-comment-12-0',post_id:'demo-post-12',user_id:priya,content:"Would love to connect and learn more.",created_at:now},{id:'demo-comment-12-1',post_id:'demo-post-12',user_id:sophie,content:"Such a useful reminder for founders.",created_at:now},{id:'demo-comment-13-0',post_id:'demo-post-13',user_id:sophie,content:"Such a useful reminder for founders.",created_at:now},{id:'demo-comment-13-1',post_id:'demo-post-13',user_id:daniel,content:"Really interesting. Keep us updated!",created_at:now},{id:'demo-comment-13-2',post_id:'demo-post-13',user_id:chloe,content:"We have been thinking about this too.",created_at:now},{id:'demo-comment-14-0',post_id:'demo-post-14',user_id:daniel,content:"Really interesting. Keep us updated!",created_at:now},{id:'demo-comment-14-1',post_id:'demo-post-14',user_id:chloe,content:"We have been thinking about this too.",created_at:now},{id:'demo-comment-14-2',post_id:'demo-post-14',user_id:lucas,content:"Great work! Excited to follow your progress.",created_at:now},{id:'demo-comment-14-3',post_id:'demo-post-14',user_id:alex,content:"This is exactly what early-stage founders need.",created_at:now}],
 conversations:[{id:'demo-chat-1',name:'',type:'direct',created_at:now},{id:'demo-chat-2',name:'',type:'direct',created_at:now},{id:'demo-chat-3',name:'',type:'direct',created_at:now}],
 conversation_members:[{conversation_id:'demo-chat-1',user_id:guest},{conversation_id:'demo-chat-1',user_id:emma},{conversation_id:'demo-chat-2',user_id:guest},{conversation_id:'demo-chat-2',user_id:daniel},{conversation_id:'demo-chat-3',user_id:guest},{conversation_id:'demo-chat-3',user_id:sophie}],
 messages:[
 {id:'m1',conversation_id:'demo-chat-1',sender_id:emma,content:'Hi! I saw your project on Veylo. Could we discuss a branding partnership?',created_at:'2026-10-19T09:00:00.000Z'},
 {id:'m2',conversation_id:'demo-chat-1',sender_id:guest,content:'Absolutely! We are preparing for launch.',created_at:'2026-10-19T09:05:00.000Z'},
 {id:'m3',conversation_id:'demo-chat-1',sender_id:emma,content:'Excellent. I can put together a proposal for your team.',created_at:'2026-10-19T09:08:00.000Z'},
 {id:'m4',conversation_id:'demo-chat-2',sender_id:daniel,content:'Our investment team is meeting startup founders this month. What stage are you at?',created_at:'2026-10-19T10:05:00.000Z'},
 {id:'m5',conversation_id:'demo-chat-2',sender_id:guest,content:'We have an early beta and are gathering our first users.',created_at:'2026-10-19T10:10:00.000Z'},
 {id:'m6',conversation_id:'demo-chat-3',sender_id:sophie,content:'The website prototype is ready for review. Project notes are in our Office.',created_at:'2026-10-19T11:00:00.000Z'}],
 conversation_reads:[],
 offices:[{id:'demo-office-1',name:'Apex Startup Studio',description:'Product launch and business planning.',owner_id:guest,created_at:now,tasks:[{id:'t1',title:'Review investor pitch',complete:false},{id:'t2',title:'Approve landing page',complete:true}],notes:[{id:'n1',content:'Review the partner proposal before Friday.',createdAt:now}],meetings:[{id:'meet1',title:'Project catch-up',date:'2026-10-22',time:'10:00'}]},{id:'demo-office-2',name:'Northstar Digital Project',description:'Collaborating on the new platform design.',owner_id:guest,created_at:now,tasks:[{id:'t3',title:'Review prototype',complete:false}],notes:[],meetings:[]}],
 office_members:[{office_id:'demo-office-1',user_id:guest},{office_id:'demo-office-1',user_id:alex},{office_id:'demo-office-1',user_id:emma},{office_id:'demo-office-2',user_id:guest},{office_id:'demo-office-2',user_id:sophie}]
};
const copy=(v:unknown)=>JSON.parse(JSON.stringify(v));
function query(table:string){
 let action:'select'|'insert'|'update'|'delete'|'upsert'='select';
 let dataInput:Row[]=[];let filters:((r:Row)=>boolean)[]=[];let descending=false;let sortKey='';let single=false;let max=0;let selectEnabled=false;
 const builder={
 select(_fields?:string){selectEnabled=true;return builder;},
 eq(key:string,value:unknown){filters.push(r=>r[key]===value);return builder;},
 neq(key:string,value:unknown){filters.push(r=>r[key]!==value);return builder;},
 in(key:string,values:unknown[]){filters.push(r=>values.includes(r[key]));return builder;},
 order(key:string,opts?:{ascending?:boolean}){sortKey=key;descending=opts?.ascending===false;return builder;},
 limit(n:number){max=n;return builder;},
 range(a:number,b:number){max=b-a+1;return builder;},
 single(){single=true;return builder;},maybeSingle(){single=true;return builder;},
 insert(v:Row|Row[]){action='insert';dataInput=Array.isArray(v)?v:[v];return builder;},
 update(v:Row){action='update';dataInput=[v];return builder;},
 upsert(v:Row|Row[]){action='upsert';dataInput=Array.isArray(v)?v:[v];return builder;},
 delete(){action='delete';return builder;},
 // Only in-memory rows are ever queried or mutated.
 then(resolve:(result:{data:unknown;error:null})=>unknown,reject?:(reason:unknown)=>unknown){
  try{
   const rows=tables[table]||(tables[table]=[]);
   let found=rows.filter(row=>filters.every(f=>f(row)));
   let output:Row[]=[];
   if(action==='select')output=found.map(row=>copy(row) as Row);
   if(action==='insert'||action==='upsert'){
    output=dataInput.map(row=>({created_at:now,id:crypto.randomUUID(),...copy(row) as Row}));
    if(action==='upsert')for(const record of output){const i=rows.findIndex(r=>r.id===record.id&&r.id!==undefined);if(i>=0)rows[i]=record;else rows.push(record)}
    else rows.push(...output);
   }
   if(action==='update'){for(const row of found)Object.assign(row,copy(dataInput[0]));output=found.map(x=>copy(x) as Row)}
   if(action==='delete'){output=found.map(x=>copy(x) as Row);tables[table]=rows.filter(x=>!found.includes(x))}
   if(sortKey)output.sort((a,b)=>String(a[sortKey]||'').localeCompare(String(b[sortKey]||''))*(descending?-1:1));
   if(max)output=output.slice(0,max);
   return Promise.resolve(resolve({data:single?(output[0]||null):((action==='select'||selectEnabled)?output:null),error:null}));
  }catch(e){return reject?Promise.resolve(reject(e)):Promise.reject(e)}
 }
 };
 return builder;
}
const channel=()=>({on(){return this},subscribe(callback?:((status:string)=>void)){if(callback)queueMicrotask(()=>callback('SUBSCRIBED'));return this},send:async()=>({status:'ok'}),unsubscribe:async()=>({status:'ok'})});
const fake={
 from:query,
 auth:{
  getUser:async()=>({data:{user:{id:guest,email:'guest@example.invalid'}},error:null}),
  getSession:async()=>({data:{session:null},error:null}),
  onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),
  signOut:async()=>({error:null})
 },
 channel,removeChannel:async()=>({error:null}),realtime:{setAuth:async()=>{}},
 storage:{from:()=>({upload:async()=>({data:{path:'demo'},error:null}),remove:async()=>({data:[],error:null}),getPublicUrl:()=>({data:{publicUrl:''}}),createSignedUrl:async()=>({data:{signedUrl:''},error:null})})}
};
export const demoSupabase=fake as unknown as SupabaseClient;
export const DEMO_MEMBER_ID=guest;
