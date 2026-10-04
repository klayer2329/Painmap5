/* Patient accounts use an independent session from the research/admin clients. */
(function(){
 'use strict';
 const cfg=window.HOOPFOOT_DATA_CONFIG||{};
 const db=window.supabase?.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{storageKey:'painmap.personal.auth.v1',persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 let user=null,subscribed=false;
 const canonical=v=>JSON.stringify(v,(_,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.keys(x).sort().reduce((a,k)=>(a[k]=x[k],a),{}):x);
 const clean=v=>JSON.parse(JSON.stringify(v));
 const uuid=()=>crypto.randomUUID();
 const draftKey=()=>user?'painmap.personal.draft.'+user.id:'painmap.screening.draft.v1';
 const api={db,uuid,get user(){return user;},draftKey,
  async init(){if(!db)return;const {data,error}=await db.auth.getSession();if(error)throw error;user=data.session?.user||null;if(!subscribed){subscribed=true;db.auth.onAuthStateChange((event,session)=>{const next=session?.user||null;if(user?.id!==next?.id){user=next;window.dispatchEvent(new Event('painmap-account-change'));}});}},
  async list(){const rows=[];for(let from=0;;from+=500){const {data,error}=await db.from('personal_screenings').select('*').order('created_at',{ascending:false}).order('id',{ascending:false}).range(from,from+499);if(error)throw error;rows.push(...(data||[]));if(!data||data.length<500)return rows;}},
  async get(id){const {data,error}=await db.from('personal_screenings').select('*').eq('id',id).single();if(error)throw error;return data;},
  async save(state,outcome,base,scores,ranking,emergency){
   if(!user)return null;
   const id=state._personalId||(state._personalId=uuid());
   const row={id,user_id:user.id,episode_id:state._episodeId||(state._episodeId=uuid()),source_id:state._sourceId||null,outcome,snapshot:clean({recordLabel:state._recordLabel||'',reportText:state._reportText||'',version:1,appVersion:'20261004-accounts',answers:state.answers,mode:state.mode,testResults:state.testResults,baseScores:base?.scores||{},finalScores:scores,ranking,emergency})};
   const {error}=await db.from('personal_screenings').insert(row);
   if(error){if(error.code==='23505'){const existing=await api.get(id);if(canonical(existing.snapshot)!==canonical(row.snapshot))throw new Error('Snapshot conflict');return existing;}throw error;}
   return row;
  },
  start(record,label){
   if(!user)throw new Error('Sign in first');
   if(record&&record.user_id!==user.id)throw new Error('Record owner mismatch');
   const data={_recordLabel:label||record?.snapshot.recordLabel||'',answers:record?clean(record.snapshot.answers):{},testResults:record?clean(record.snapshot.testResults||{}):{},mode:record?.snapshot.mode||null,qIndex:0,aIndex:0,yIndex:0,fIndex:0,dataConsent:false,sessionId:uuid(),submissionId:null,_personalId:uuid(),_episodeId:record?.episode_id||uuid(),_sourceId:record?.id||null,_personalSaved:false};
   localStorage.setItem(draftKey(),JSON.stringify({version:1,savedAt:Date.now(),data}));
   location.href='./index.html';
  }
 };
 window.PainmapAccount=api;
})();
