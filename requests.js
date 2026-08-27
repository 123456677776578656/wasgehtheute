(()=>{
const cfg=window.WGH_SUPABASE||{},SB=window.supabase?.createClient?.(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
window.WGH_REQUESTS={client:SB};
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);const validUrl=v=>!v||/^https?:\/\/[^\s]+$/i.test(v);
function val(form,name){return form.elements[name]?.value?.trim?.()||''}
function lock(btn,on){if(!btn)return;btn.disabled=on;btn.setAttribute('aria-busy',on?'true':'false')}
function tooFast(key){const now=Date.now(),last=Number(localStorage.getItem(key)||0);if(now-last<12000)return true;localStorage.setItem(key,String(now));return false}
async function submit(form,type,msg){
 if(!SB){msg.textContent='Die Anfrage konnte momentan nicht gesendet werden. Bitte versuche es später erneut.';return}
 const hp=val(form,'website_check');if(hp)return;
 if(tooFast('wgh_request_last_submit')){msg.textContent='Bitte warte kurz, bevor du erneut sendest.';return}
 const email=val(form,'email'),website=val(form,'website'),ticket=val(form,'ticket_url');
 if(!validEmail(email)||!validUrl(website)||!validUrl(ticket)){msg.textContent='Bitte prüfe E-Mail-Adresse und Links.';return}
 const data={type,name:val(form,'name').slice(0,120),company:val(form,'company').slice(0,160)||null,email:email.slice(0,254),subject:val(form,'subject').slice(0,180)||null,event_name:val(form,'event_name').slice(0,180)||null,place:val(form,'place').slice(0,160)||null,venue:val(form,'venue').slice(0,180)||null,event_date:val(form,'event_date')||null,event_time:val(form,'event_time').slice(0,80)||null,category:val(form,'category').slice(0,100)||null,description:val(form,'description').slice(0,3000)||null,website:website.slice(0,500)||null,ticket_url:ticket.slice(0,500)||null,ad_placement:val(form,'ad_placement').slice(0,160)||null,ad_period:val(form,'ad_period').slice(0,160)||null,message:val(form,'message').slice(0,3000)||null};
 if(type==='event'&&(!data.name||!email||!data.event_name||!data.place||!data.event_date||!data.website)){msg.textContent='Bitte fülle alle Pflichtfelder aus.';return}
 if(type==='werbung'&&(!data.name||!email||!data.company||!data.ad_placement||!data.ad_period)){msg.textContent='Bitte fülle alle Pflichtfelder aus.';return}
 const btn=form.querySelector('button[type="submit"]');lock(btn,true);msg.textContent='Wird sicher übermittelt…';
 try{const {error}=await SB.from('requests').insert(data);if(error)throw error;form.reset();msg.textContent=type==='event'?'✓ Vielen Dank! Deine Veranstaltung wurde übermittelt und wartet auf Prüfung.':'✓ Vielen Dank! Deine Werbeanfrage wurde übermittelt. Wir prüfen die Anfrage.'}
 catch(e){console.error('request-submit',e);msg.textContent='Die Anfrage konnte momentan nicht gesendet werden. Bitte versuche es später erneut.'}
 finally{setTimeout(()=>lock(btn,false),2500)}
}
function bind(id,type,msgId){const f=document.getElementById(id),m=document.getElementById(msgId);if(f&&m)f.addEventListener('submit',e=>{e.preventDefault();submit(f,type,m)})}
bind('eventRequestForm','event','eventRequestMsg');bind('adRequestForm','werbung','adRequestMsg');
})();
