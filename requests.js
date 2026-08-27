(()=>{
const cfg=window.WGH_SUPABASE||{};
const SB=window.supabase?.createClient?.(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.WGH_REQUESTS={client:SB};

const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
const validUrl=v=>!v||/^https?:\/\/[^\s]+$/i.test(v);
const text=v=>String(v??'').trim();
function val(form,name){return text(form.elements[name]?.value)}
function lock(btn,on){if(!btn)return;btn.disabled=on;btn.setAttribute('aria-busy',on?'true':'false')}
function tooFast(key){const now=Date.now(),last=Number(localStorage.getItem(key)||0);if(now-last<12000)return true;localStorage.setItem(key,String(now));return false}
function fail(msg,copy='Die Anfrage konnte momentan nicht gesendet werden. Bitte versuche es später erneut.'){if(msg)msg.textContent=copy}

async function submitPayload(data,msg,form,successText){
  if(!SB)return fail(msg);
  if(tooFast('wgh_request_last_submit'))return fail(msg,'Bitte warte kurz, bevor du erneut sendest.');
  const btn=form?.querySelector('button[type="submit"]');lock(btn,true);if(msg)msg.textContent='Wird sicher übermittelt…';
  try{
    const {error}=await SB.from('wgh_requests').insert({...data,status:'neu',admin_note:null,honeypot:''});
    if(error)throw error;
    form?.reset();
    if(msg)msg.textContent=successText;
  }catch(e){console.error('wgh-request-submit',e);fail(msg)}
  finally{setTimeout(()=>lock(btn,false),1800)}
}

async function submitOrganizerForm(form,type,msg){
  const hp=val(form,'website_check');if(hp)return;
  const email=val(form,'email'),website=val(form,'website'),ticket=val(form,'ticket_url');
  if(!validEmail(email)||!validUrl(website)||!validUrl(ticket))return fail(msg,'Bitte prüfe E-Mail-Adresse und Links.');
  const data={
    type,
    name:val(form,'name').slice(0,120),
    company:val(form,'company').slice(0,160)||null,
    email:email.slice(0,254),
    subject:val(form,'subject').slice(0,180)||null,
    event_name:val(form,'event_name').slice(0,200)||null,
    place:val(form,'place').slice(0,160)||null,
    venue:val(form,'venue').slice(0,200)||null,
    event_date:val(form,'event_date')||null,
    event_time:val(form,'event_time').slice(0,80)||null,
    category:val(form,'category').slice(0,100)||null,
    description:val(form,'description').slice(0,4000)||null,
    website:website.slice(0,1000)||null,
    ticket_url:ticket.slice(0,1000)||null,
    ad_slot:val(form,'ad_placement').slice(0,180)||null,
    desired_period:val(form,'ad_period').slice(0,180)||null,
    message:val(form,'message').slice(0,4000)||null
  };
  if(type==='event'&&(!data.name||!email||!data.event_name||!data.place||!data.event_date||!data.website))return fail(msg,'Bitte fülle alle Pflichtfelder aus.');
  if(type==='werbung'&&(!data.name||!email||!data.company||!data.ad_slot||!data.desired_period))return fail(msg,'Bitte fülle alle Pflichtfelder aus.');
  const success=type==='event'
    ?'✓ Vielen Dank! Deine Veranstaltung wurde übermittelt und wartet auf Prüfung.'
    :'✓ Vielen Dank! Deine Werbeanfrage wurde übermittelt. Wir prüfen die Anfrage.';
  await submitPayload(data,msg,form,success);
}

async function submitQuickForm(form,msg){
  if(val(form,'website_check'))return;
  const type=form.elements.request_type?.value==='Werbeanzeige anfragen'?'werbung':'event';
  const email=text(form.elements.email?.value),website=text(form.elements.website?.value);
  if(!validEmail(email)||!validUrl(website))return fail(msg,'Bitte prüfe E-Mail-Adresse und Info-Link.');
  const name=text(form.elements.name?.value).slice(0,120),subject=text(form.elements.subject?.value).slice(0,200),place=text(form.elements.place?.value).slice(0,160),eventDate=text(form.elements.event_date?.value),message=text(form.elements.message?.value).slice(0,4000);
  if(type==='event'&&(!name||!email||!subject||!place||!eventDate||!website))return fail(msg,'Bitte fülle Name, E-Mail, Eventtitel, Ort, Datum und Info-Link aus.');
  if(type==='werbung'&&(!name||!email||!subject||!message))return fail(msg,'Bitte fülle Name, E-Mail, Betreff und Nachricht aus.');
  const data={type,name,email,subject:subject||null,event_name:type==='event'?subject:null,place:place||null,event_date:eventDate||null,website:website||null,message:message||null,company:type==='werbung'?subject:null};
  const success=type==='event'
    ?'✓ Vielen Dank! Deine Veranstaltung wurde übermittelt und wartet auf Prüfung.'
    :'✓ Vielen Dank! Deine Werbeanfrage wurde übermittelt. Wir prüfen die Anfrage.';
  await submitPayload(data,msg,form,success);
}

function bind(id,type,msgId){const f=document.getElementById(id),m=document.getElementById(msgId);if(f&&m&&!f.dataset.wghBound){f.dataset.wghBound='1';f.addEventListener('submit',e=>{e.preventDefault();submitOrganizerForm(f,type,m)})}}
bind('eventRequestForm','event','eventRequestMsg');
bind('adRequestForm','werbung','adRequestMsg');

const quick=document.getElementById('actionForm'),quickMsg=document.getElementById('demoMsg');
if(quick&&quickMsg&&!quick.dataset.wghBound){
  quick.dataset.wghBound='1';
  const map=[['formName','name'],['formEmail','email'],['requestType','request_type'],['formSubject','subject'],['formPlace','place'],['formDate','event_date'],['formLink','website'],['formMessage','message']];
  map.forEach(([id,name])=>{const el=document.getElementById(id);if(el&&!el.name)el.name=name});
  quick.addEventListener('submit',e=>{e.preventDefault();submitQuickForm(quick,quickMsg)});
}
})();
