(()=>{
const cfg=window.WGH_SUPABASE||{};
const SB=window.supabase?.createClient?.(cfg.url,cfg.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
if(!SB)return;
const $=s=>document.querySelector(s),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),fmt=d=>d?new Intl.DateTimeFormat('de-CH',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Zurich'}).format(new Date(d)):'–';
let rows=[],active=null,mfaMode='',mfaFactorId=null;
const login=$('#adminLogin'),mfa=$('#adminMfa'),shell=$('#adminProtected'),msg=$('#adminLoginMsg'),mfaMsg=$('#mfaMsg'),list=$('#requestList'),detail=$('#requestDetail');
const statusLabel={neu:'NEU',in_pruefung:'IN PRÜFUNG',akzeptiert:'AKZEPTIERT',abgelehnt:'ABGELEHNT',erledigt:'ERLEDIGT'};
async function isAdmin(user){if(!user?.id)return false;const {data,error}=await SB.from('wgh_admins').select('user_id').eq('user_id',user.id).maybeSingle();return !error&&!!data}
async function aal(){const {data,error}=await SB.auth.mfa.getAuthenticatorAssuranceLevel();return error?null:data}
async function hasAal2(){const data=await aal();return data?.currentLevel==='aal2'}
function setView(view){login.hidden=view!=='login';mfa.hidden=view!=='mfa';shell.hidden=view!=='admin'}
function showLogin(){setView('login');msg.textContent='';if(mfaMsg)mfaMsg.textContent=''}
function showAdmin(user){setView('admin');const e=$('#adminIdentity');if(e)e.textContent=user.email||'Administrator'}
function qrSrc(value){const q=String(value||'').trim();if(!q)return'';if(q.startsWith('data:'))return q;if(q.startsWith('<svg'))return'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(q);return q}
async function requireMfa(user){
  const level=await aal();
  if(level?.currentLevel==='aal2'){showAdmin(user);await load();return}
  const factors=await SB.auth.mfa.listFactors();
  if(factors.error){await SB.auth.signOut();showLogin();msg.textContent='2-Faktor-Prüfung konnte nicht geladen werden.';return}
  const totp=factors.data?.totp||[];
  const verified=totp.find(f=>f.status==='verified')||totp.find(f=>!f.status)||null;
  setView('mfa');mfaMsg.textContent='';$('#mfaCode').value='';$('#mfaQrWrap').hidden=true;
  if(verified){
    mfaMode='challenge';mfaFactorId=verified.id;$('#mfaTitle').textContent='2-Faktor-Anmeldung';$('#mfaIntro').textContent='Gib den 6-stelligen Code aus deiner Authenticator-App ein.';$('#mfaSetup').hidden=true;$('#mfaCodeForm').hidden=false;$('#mfaCode').focus();
  }else{
    mfaMode='setup';mfaFactorId=null;$('#mfaTitle').textContent='2-Faktor-Schutz einrichten';$('#mfaIntro').textContent='Für Administratoren ist eine Authenticator-App erforderlich, bevor Anfragen geöffnet werden können.';$('#mfaSetup').hidden=false;$('#startMfaEnroll').hidden=false;$('#startMfaEnroll').disabled=false;$('#mfaCodeForm').hidden=true;
  }
}
async function refreshSession(){const {data:{session}}=await SB.auth.getSession();if(session&&await isAdmin(session.user)){await requireMfa(session.user)}else{if(session)await SB.auth.signOut();showLogin()}}
async function signIn(ev){ev.preventDefault();msg.textContent='Anmeldung läuft…';const email=$('#adminEmail').value.trim(),password=$('#adminPassword').value;const {data,error}=await SB.auth.signInWithPassword({email,password});if(error||!await isAdmin(data.user)){if(data.session)await SB.auth.signOut();msg.textContent='Admin-Anmeldung erforderlich';return}msg.textContent='';await requireMfa(data.user)}
async function startMfaEnrollment(){
  const button=$('#startMfaEnroll');button.disabled=true;mfaMsg.textContent='2-Faktor-Schutz wird vorbereitet…';
  const factors=await SB.auth.mfa.listFactors();
  if(!factors.error){const all=factors.data?.all||[];for(const factor of all){if(factor.factor_type==='totp'&&factor.status&&factor.status!=='verified'){await SB.auth.mfa.unenroll({factorId:factor.id})}}}
  const {data,error}=await SB.auth.mfa.enroll({factorType:'totp',friendlyName:'WasGehtHeute Admin'});
  if(error||!data?.id){button.disabled=false;mfaMsg.textContent='2-Faktor-Schutz konnte nicht eingerichtet werden. Bitte erneut anmelden und nochmals versuchen.';return}
  mfaMode='enroll';mfaFactorId=data.id;const src=qrSrc(data.totp?.qr_code);if(src)$('#mfaQr').src=src;$('#mfaSecret').textContent=data.totp?.secret||'';$('#mfaQrWrap').hidden=false;$('#mfaCodeForm').hidden=false;button.hidden=true;mfaMsg.textContent='';$('#mfaCode').focus();
}
async function verifyMfa(ev){
  ev.preventDefault();const code=$('#mfaCode').value.trim();if(!/^\d{6}$/.test(code)||!mfaFactorId){mfaMsg.textContent='Bitte einen gültigen 6-stelligen Code eingeben.';return}
  const button=$('#mfaVerifyButton');button.disabled=true;mfaMsg.textContent='Code wird geprüft…';
  const challenge=await SB.auth.mfa.challenge({factorId:mfaFactorId});
  if(challenge.error){button.disabled=false;mfaMsg.textContent='Die 2-Faktor-Prüfung konnte nicht gestartet werden.';return}
  const verify=await SB.auth.mfa.verify({factorId:mfaFactorId,challengeId:challenge.data.id,code});
  if(verify.error){button.disabled=false;$('#mfaCode').select();mfaMsg.textContent='Der Code ist ungültig oder abgelaufen. Bitte versuche es erneut.';return}
  await SB.auth.refreshSession();const {data:{session}}=await SB.auth.getSession();button.disabled=false;
  if(!session||!await isAdmin(session.user)||!await hasAal2()){await SB.auth.signOut();showLogin();msg.textContent='2-Faktor-Anmeldung konnte nicht bestätigt werden.';return}
  mfaMsg.textContent='';showAdmin(session.user);await load();
}
async function ensureAdminAal2(){const {data:{session}}=await SB.auth.getSession();if(!session||!await isAdmin(session.user)||!await hasAal2()){if(session?.user&&await isAdmin(session.user))await requireMfa(session.user);else showLogin();return false}return true}
async function load(){if(!await ensureAdminAal2())return;const {data,error}=await SB.from('wgh_requests').select('*').order('created_at',{ascending:false});if(error){list.innerHTML='<p>Anfragen konnten nicht geladen werden.</p>';return}rows=data||[];renderStats();renderList()}
function renderStats(){const n=s=>rows.filter(r=>r.status===s).length;[['rNeu',n('neu')],['rPruefung',n('in_pruefung')],['rAkzeptiert',n('akzeptiert')],['rErledigt',n('erledigt')]].forEach(([id,v])=>{const e=document.getElementById(id);if(e)e.textContent=v})}
function renderList(){if(!rows.length){list.innerHTML='<p>Noch keine Anfragen vorhanden.</p>';return}list.innerHTML=rows.map(r=>`<article class="request-row"><div class="request-main"><div class="request-type">${r.type==='werbung'?'WERBUNG':'EVENT'}</div><h3>${esc(r.event_name||r.subject||r.company||'Anfrage')}</h3><p>${r.place?'📍 '+esc(r.place)+' · ':''}${r.event_date?'📅 '+esc(r.event_date)+' · ':''}👤 ${esc(r.name)}<br>✉️ <a href="mailto:${encodeURIComponent(r.email)}">${esc(r.email)}</a></p><span class="request-status status-${esc(r.status)}">${statusLabel[r.status]||esc(r.status)}</span></div><div class="request-actions"><button data-detail="${r.id}">Details</button><button data-status="in_pruefung" data-id="${r.id}">In Prüfung</button><button data-status="akzeptiert" data-id="${r.id}">Akzeptieren</button><button data-status="abgelehnt" data-id="${r.id}">Ablehnen</button><button data-status="erledigt" data-id="${r.id}">Erledigt</button></div></article>`).join('')}
async function setStatus(id,status){if(!await ensureAdminAal2())return;const {error}=await SB.from('wgh_requests').update({status,last_updated_at:new Date().toISOString()}).eq('id',id);if(error){alert('Status konnte nicht gespeichert werden.');return}await load();if(active?.id==id)openDetail(id)}
function field(label,value,link=false){if(value===null||value===undefined||value==='')return'';const v=link?`<a href="${esc(value)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>`:esc(value);return`<div class="detail-field"><b>${esc(label)}</b><span>${v}</span></div>`}
function proposal(r){return {title:r.event_name||'',city:r.place||'',region:'',start:r.event_date||'',end:r.event_date||'',date:r.event_date||'',time:r.event_time||'',venue:r.venue||'',cats:r.category?[r.category]:[],desc:r.description||r.message||'',source:r.website||'',ticket:r.ticket_url||'',verified:false,verified_at:'',source_type:'Veranstalteranfrage – vor Veröffentlichung prüfen'} }
function openDetail(id){const r=rows.find(x=>String(x.id)===String(id));if(!r)return;active=r;detail.innerHTML=`<div class="detail-head"><div><div class="eyebrow">${r.type==='werbung'?'Werbeanfrage':'Eventanfrage'}</div><h2>${esc(r.event_name||r.subject||r.company||'Anfrage')}</h2></div><button id="closeRequestDetail" aria-label="Schliessen">×</button></div><div class="detail-grid">${field('Anfrage-ID',r.id)}${field('Eingang',fmt(r.created_at))}${field('Art',r.type)}${field('Name',r.name)}${field('Firma',r.company)}${field('E-Mail',r.email)}${field('Eventname',r.event_name)}${field('Ort',r.place)}${field('Venue',r.venue)}${field('Datum',r.event_date)}${field('Uhrzeit',r.event_time)}${field('Kategorie',r.category)}${field('Beschreibung',r.description)}${field('Webseite',r.website,true)}${field('Ticketlink',r.ticket_url,true)}${field('Werbeplatz',r.ad_slot)}${field('Zeitraum',r.desired_period)}${field('Nachricht',r.message)}${field('Status',statusLabel[r.status]||r.status)}</div><label class="admin-note">Admin-Notiz<textarea id="adminNote" rows="5" maxlength="5000">${esc(r.admin_note||'')}</textarea></label><div class="detail-buttons"><button id="saveAdminNote">Notiz speichern</button>${r.type==='event'&&r.status==='akzeptiert'?'<button id="prepareEvent">Event zur Veröffentlichung vorbereiten</button>':''}</div><div id="publishProposal"></div>`;detail.hidden=false;$('#closeRequestDetail').onclick=()=>{detail.hidden=true;active=null};$('#saveAdminNote').onclick=saveNote;if($('#prepareEvent'))$('#prepareEvent').onclick=()=>{$('#publishProposal').innerHTML=`<div class="publish-proposal"><h3>Event zur Veröffentlichung vorbereiten</h3><p><b>Noch nicht veröffentlicht.</b> Region, Enddatum und alle Angaben müssen vor Aufnahme in den Eventbestand nochmals anhand der Originalquelle bestätigt werden.</p><pre>${esc(JSON.stringify(proposal(r),null,2))}</pre></div>`}}
async function saveNote(){if(!active||!await ensureAdminAal2())return;const admin_note=$('#adminNote').value.trim().slice(0,5000)||null;const {error}=await SB.from('wgh_requests').update({admin_note,last_updated_at:new Date().toISOString()}).eq('id',active.id);if(error){alert('Notiz konnte nicht gespeichert werden.');return}const id=active.id;await load();openDetail(id)}
list.addEventListener('click',e=>{const d=e.target.closest('[data-detail]');if(d)return openDetail(d.dataset.detail);const s=e.target.closest('[data-status]');if(s)setStatus(s.dataset.id,s.dataset.status)});
$('#adminLoginForm')?.addEventListener('submit',signIn);$('#startMfaEnroll')?.addEventListener('click',startMfaEnrollment);$('#mfaCodeForm')?.addEventListener('submit',verifyMfa);$('#mfaLogout')?.addEventListener('click',async()=>{await SB.auth.signOut();showLogin()});$('#adminLogout')?.addEventListener('click',async()=>{await SB.auth.signOut();showLogin()});SB.auth.onAuthStateChange((_e,session)=>{if(!session)showLogin()});refreshSession();
})();
