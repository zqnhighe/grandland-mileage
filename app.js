'use strict';
const START = '2026-08-10', END = '2030-08-10', BASE = 10994, ALLOWANCE = 40000, DAY = 86400000;
// Require a real, four-digit ISO calendar date; Date.parse alone normalises invalid dates.
function validDate(s) {
 if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
 const time = Date.parse(s + 'T00:00:00Z');
 return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === s;
}
const stamp = s => Date.parse(s + 'T00:00:00Z');
const TOTAL = (stamp(END)-stamp(START))/DAY;
const clamp = (v,a,b) => Math.max(a, Math.min(v,b));
function targetAt(date) { const elapsed=clamp((stamp(date)-stamp(START))/DAY,0,TOTAL); return {elapsed,earned:ALLOWANCE*elapsed/TOTAL,target:BASE+ALLOWANCE*elapsed/TOTAL}; }
function londonToday() { return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/London',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()); }
const number = n => Math.round(n).toLocaleString('en-GB');
const dateText = s => new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(stamp(s)));
const $ = id => document.getElementById(id);
const KEY='grandland-mileage-v1'; let saved=null, today=londonToday();
function validReading(r){
 return r !== null && typeof r === 'object' && !Array.isArray(r) &&
 Object.keys(r).length === 2 && Object.hasOwn(r, 'miles') && Object.hasOwn(r, 'date') &&
 Number.isSafeInteger(r.miles) && r.miles >= BASE && r.miles <= 9999999 &&
 validDate(r.date) && r.date >= START && r.date <= today;
}
// localStorage is untrusted and shared with other pages on this origin.
// Bound parsing work and copy only validated fields; never merge stored objects.
function decodeReading(raw){
 if (typeof raw !== 'string' || raw.length > 256) return null;
 try { const value = JSON.parse(raw); return validReading(value) ? {miles:value.miles,date:value.date} : null; }
 catch { return null; }
}
try { saved = decodeReading(localStorage.getItem(KEY)); }
catch { $('error').textContent='Browser storage is unavailable. Readings will last for this visit only.'; }
function renderActual(){
 if(!saved){$('status').className='status';$('status').textContent='Add your odometer reading to see your position.';$('budget').textContent='—';$('projection').textContent='—';return;}
 const at=targetAt(saved.date),difference=saved.miles-at.target,left=BASE+ALLOWANCE-saved.miles;
 $('status').className='status'+(difference>0?' warn':'');
 const title=document.createElement('div'); title.textContent=Math.abs(difference)<.5?'On your mileage target':number(Math.abs(difference))+' miles '+(difference>0?'above':'below')+' your target';
 const note=document.createElement('small'); note.textContent=number(saved.miles)+' mi recorded '+dateText(saved.date)+'. Compared with that day’s target.'+(saved.date!==today?' Update for today’s position.':'');
 $('status').replaceChildren(title,note);$('budget').textContent=left>=0?number(left):number(-left)+' over';
 const actualDays=(stamp(saved.date)-stamp(START))/DAY;
 $('projection').textContent=actualDays<=0?'—':saved.date>=END?number(saved.miles):number(BASE+(saved.miles-BASE)/actualDays*TOTAL);
}
function renderToday(){today=londonToday();const t=targetAt(today);$('todayLabel').textContent=dateText(today);$('target').textContent=number(t.target);$('earned').textContent=number(t.earned);$('progress').style.width=100*t.elapsed/TOTAL+'%';$('remaining').style.width=100*(1-t.elapsed/TOTAL)+'%';$('percent').textContent=(100*t.elapsed/TOTAL).toFixed(1)+'% of agreement elapsed';$('days').textContent=number(Math.max(0,(stamp(END)-stamp(today))/DAY));$('daily').textContent=(ALLOWANCE/TOTAL).toFixed(2)+' mi';$('phase').textContent=today<START?'NOT STARTED':today>=END?'COMPLETE':'ACTIVE';$('targetLabel').textContent=today>=END?'Final odometer limit':today<START?'Starting odometer':"Today's target odometer";renderActual();}
function renderPlanner(){const d=$('planDate').value;if(!validDate(d))return;const t=targetAt(d);$('planTarget').textContent=number(t.target);$('planAllowance').textContent=number(t.earned)+' mi allowance';$('slider').value=t.elapsed;$('planNote').textContent=d<START?'Before the agreement begins: starting mileage applies.':d>END?'After the agreement ends: the final limit stays at 50,994 miles.':'Target for '+dateText(d)+'.';}
$('readingForm').addEventListener('submit',event=>{event.preventDefault();today=londonToday();const miles=Number($('reading').value);if(today<START){$('error').textContent='You can save a reading once the agreement starts.';return;}if(!$('reading').value||!Number.isSafeInteger(miles)||miles<BASE||miles>9999999){$('error').textContent='Enter a whole-mile reading of at least 10,994.';return;}saved={miles,date:today};$('error').textContent='';try{localStorage.setItem(KEY,JSON.stringify(saved));}catch(e){$('error').textContent='Storage unavailable. This reading is held for this visit only.';}renderToday();});
$('planDate').value=today;$('slider').max=TOTAL;$('planDate').addEventListener('input',renderPlanner);$('slider').addEventListener('input',()=>{const offset=Number($('slider').value);if(!Number.isInteger(offset)||offset<0||offset>TOTAL)return;$('planDate').value=new Date(stamp(START)+offset*DAY).toISOString().slice(0,10);renderPlanner();});
$('pure').addEventListener('click',()=>{const on=document.body.classList.toggle('pure');$('pure').setAttribute('aria-pressed',String(on));$('pure').textContent=on?'Exit pure mode':'Pure mode';});
$('clear').addEventListener('click',()=>{if(!saved)return;if(!confirm('Clear the saved odometer reading from this browser?'))return;try{localStorage.removeItem(KEY);}catch(e){$('error').textContent='Unable to clear browser storage.';return;}saved=null;$('reading').value='';renderActual();});
$('export').addEventListener('click',()=>{if(!saved){$('error').textContent='Save a mileage reading before exporting.';$('reading').focus();return;}const blob=new Blob(['date,odometer_miles\n'+saved.date+','+saved.miles+'\n'],{type:'text/csv'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='grandland-mileage.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
if(saved)$('reading').value=saved.miles;renderToday();renderPlanner();setInterval(renderToday,60000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderToday();});
