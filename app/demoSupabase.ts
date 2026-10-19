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

/* Additional fictional activity. Deterministic seed data; never connects to production. */
const demoPeople = [
 ['Amelia Foster','Founder · Oakline Ventures','Ireland'],
 ['Noah Carter','Founder · Northstar AI','United Kingdom'],
 ['Isabella Chen','Co-founder · Pixel Foundry','Singapore'],
 ['Ethan Rivera','Operations · Meridian Labs','United States'],
 ['Ava Thompson','Founder · Kindred Market','Canada'],
 ['Liam OConnor','Founder · Atlantic Works','Ireland'],
 ['Zara Ahmed','Creative Lead · Zest Studio','United Kingdom'],
 ['Leo Martin','Founder · Greenbridge','France'],
 ['Nina Rossi','Growth Lead · Studio Alto','Italy'],
 ['Theo Walker','Founder · Fieldnote','Australia'],
 ['Hana Kim','Product Manager · Orbit Labs','South Korea'],
 ['Mateo Silva','Founder · Nova Commerce','Portugal'],
 ['Grace Murphy','Founder · Harbour Social','Ireland'],
 ['Arjun Mehta','Founder · Foundry Finance','India'],
 ['Ella Wilson','Founder · Sunday Studio','United States'],
 ['Oscar Jensen','Founder · Nordic Growth','Denmark'],
 ['Ruby Scott','Brand Designer · Loop Creative','New Zealand'],
 ['Samir Haddad','Founder · BridgeTech','United Arab Emirates'],
 ['Freya Collins','Founder · Willow & Co','United Kingdom'],
 ['Benjamin Reed','Founder · Sparkline','Germany']
] as const;
const extraIds:string[]=[];
demoPeople.forEach(([name,headline,location],i)=>{
 const n=i+11;
 const id='00000000-0000-4000-8000-'+String(n).padStart(12,'0');
 extraIds.push(id);
 tables.profiles.push({...profile(id,n,name,headline,'Building new connections, sharing progress and collaborating with founders across the world.'),member_code:'00-00-'+String(n).padStart(4,'0'),location,avatar:'https://i.pravatar.cc/160?img='+(20+i)});
});
const demoAuthors=[alex,emma,daniel,sophie,maya,oliver,priya,lucas,chloe,...extraIds];
const demoUpdates=[
 'Monday momentum: we just finished our first customer interviews. The feedback completely changed our priorities.',
 'Looking for a freelance designer to collaborate on a small startup launch. Any recommendations?',
 'Our team is testing a new onboarding flow today. Simple beats complicated every time.',
 'Just booked three introductory calls through founder networking. Never underestimate a genuine conversation.',
 'Big milestone: our fictional brand concept is ready for its first public preview.',
 'Question for other founders: how do you organise tasks when your team is spread across different time zones?',
 'We are preparing our first investor update. What metrics do you think matter most at the early stage?',
 'Sharing a lesson from this week: customer feedback is more valuable than guessing what people want.',
 'We are expanding our demo team and looking for people passionate about product and community.',
 'A quick reminder: your first ten customers can teach you more than a hundred assumptions.',
 'Just finished a productive brainstorm with two founders in different countries. Collaboration makes a difference.',
 'Our latest brand moodboard is coming together. Really enjoying this stage of the creative process.',
 'Who else is building in public? It has been a great way to meet like-minded people.',
 'Our team shipped a small feature today. Not glamorous, but one step closer to launch.',
 'Founder question: do you prefer email, messaging or a shared office when coordinating projects?',
 'Proud of our progress this week. We finally have a clear plan for the next sprint.',
 'Looking to connect with people working in e-commerce, community and digital products.',
 'The best business conversations this week started with someone simply asking how they could help.',
 'Planning a virtual meetup for early-stage founders. What topics would you want covered?',
 'Today we reviewed our prototype with a small group of potential users. Lots to improve, lots to learn.',
 'Small business owners: what is the one repetitive task you would love to automate?',
 'We are getting our pitch deck ready. Keeping it focused on the problem and the people we serve.',
 'Really useful chat today about pricing and customer value. So much to learn from other founders.',
 'Celebrating our first sample order! Tiny milestone, massive motivation.',
 'Our team is trialling a new weekly planning system to keep everyone aligned.',
 'What are your favourite ways to build trust with new business connections?',
 'We are sharing a first look at our startup idea soon. Excited and nervous in equal measure.',
 'A lesson from our first launch: make it easy for people to tell you what is confusing.',
 'New week, new opportunities. Who is looking for a business collaborator?',
 'Just wrapped up a cross-border founder call. Amazing how much you can learn in thirty minutes.',
 'Working on a cleaner product experience. Every extra click is something worth questioning.',
 'Any startup founders here building something in sustainability or circular products?',
 'Our fictional marketing campaign is ready for testing. Curious which message resonates most.',
 'A great reminder that building a company is a team sport. Grateful for helpful collaborators.',
 'We are planning our first online workshop for founders. Would you attend?',
 'Just completed our quarterly goals review and simplified the roadmap.',
 'One thing I wish I had done earlier: write down every customer question.',
 'Anyone interested in a founder accountability group? Weekly check-ins could be useful.',
 'We are exploring new partnerships with independent creative businesses.',
 'Another productive day building, testing and learning. What did your team accomplish today?'
];
const demoResponses=[
 'Great progress. Thanks for sharing this!',
 'We are working through something similar at our startup.',
 'Would love to connect and exchange ideas.',
 'That is a really useful insight.',
 'Congratulations! Looking forward to seeing what comes next.',
 'This is exactly the sort of conversation founders need.',
 'Interesting question. We use a shared task board.',
 'I would be happy to chat about a collaboration.',
 'Love seeing founders support one another.',
 'Please keep us posted on the next milestone.'
];
demoUpdates.forEach((content,i)=>{
 const id='demo-community-post-'+(i+1);
 const author=demoAuthors[(i*7+3)%demoAuthors.length];
 const created_at=new Date(Date.UTC(2026,9,19-Math.floor(i/6),15-(i%6),i%4*11)).toISOString();
 tables.network_posts.push({id,member_id:author,content,created_at});
 for(let j=0;j<5+(i%9);j++){
  const user=demoAuthors[(i+j*3+1)%demoAuthors.length];
  if(user!==author&&!tables.network_post_likes.some(x=>x.post_id===id&&x.user_id===user))
   tables.network_post_likes.push({post_id:id,user_id:user});
 }
 for(let j=0;j<2+(i%5);j++){
  tables.network_post_comments.push({id:'demo-community-comment-'+i+'-'+j,post_id:id,user_id:demoAuthors[(i+j+4)%demoAuthors.length],content:demoResponses[(i+j)%demoResponses.length],created_at:new Date(Date.parse(created_at)+(j+1)*240000).toISOString()});
 }
});
const demoOfficeNames=[
 ['Bloom & Co Launch','Packaging, product photography and launch planning'],
 ['Brightline Marketing Hub','Content calendar and customer acquisition'],
 ['Harbour Founders Collective','Networking and community events'],
 ['Orbit Product Team','Prototype feedback and product roadmap'],
 ['Greenbridge Sustainability','Circular product strategy and partnerships'],
 ['Pixel Foundry Studio','Design reviews and client collaboration'],
 ['Northstar AI Workspace','Early product research and testing'],
 ['Sunday Studio Projects','Creative work and upcoming launches'],
 ['Nova Commerce Operations','Storefront improvements and customer experience'],
 ['Fieldnote Community','Founder interviews and audience research'],
 ['Meridian Labs Team','Product experiments and growth'],
 ['Veylo Demo Collaborators','Example business networking and team coordination']
] as const;
demoOfficeNames.forEach(([name,description],i)=>{
 const id='demo-office-'+(i+3);
 const owner=demoAuthors[i%demoAuthors.length];
 tables.offices.push({
  id,name,description,owner_id:owner,created_at:new Date(Date.UTC(2026,9,18-i)).toISOString(),
  tasks:[
   {id:id+'-task-1',title:'Review this week\'s priorities',complete:i%2===0},
   {id:id+'-task-2',title:'Share project progress with the team',complete:false},
   {id:id+'-task-3',title:'Prepare next collaboration meeting',complete:i%3===0},
   {id:id+'-task-4',title:'Gather feedback and next steps',complete:false}
  ],
  notes:[
   {id:id+'-note-1',content:'Weekly update: keep communication clear and share progress with the team.',createdAt:now},
   {id:id+'-note-2',content:'Next milestone: review the current plan and confirm responsibilities.',createdAt:now}
  ],
  meetings:[{id:id+'-meeting-1',title:'Weekly team sync',date:'2026-10-23',time:i%2?'14:00':'10:30'}]
 });
 [guest,owner,demoAuthors[(i+5)%demoAuthors.length]].forEach(user_id=>tables.office_members.push({office_id:id,user_id}));
});
extraIds.slice(0,12).forEach((id,i)=>{
 const chat='demo-community-chat-'+i;
 tables.conversations.push({id:chat,name:'',type:'direct',created_at:now});
 tables.conversation_members.push({conversation_id:chat,user_id:guest},{conversation_id:chat,user_id:id});
 const lines=[
  ['Hi! I noticed we are both building startups. What are you working on?','Great to connect! I am exploring new opportunities and collaborations.','Brilliant. Would love to compare ideas this week.'],
  ['Thanks for connecting. Are you interested in a quick founder introduction?','Absolutely. What kind of business are you building?','We are working on an early-stage digital product.'],
  ['Hey! I saw your recent post about your project.','Thanks for reaching out. How is your launch going?','Making progress every day. It would be great to collaborate.']
 ][i%3];
 lines.forEach((content,j)=>tables.messages.push({id:chat+'-message-'+j,conversation_id:chat,sender_id:j===1?guest:id,content,created_at:new Date(Date.UTC(2026,9,19,9+i%6,j*4)).toISOString()}));
});

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
