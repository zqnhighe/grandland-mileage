import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=new URL('../',import.meta.url);
const js=readFileSync(new URL('app.js',root),'utf8');
const html=readFileSync(new URL('index.html',root),'utf8');
const context=vm.createContext({Intl,Date,localStorage:{getItem:()=>null},document:{getElementById:()=>({textContent:''})}});
vm.runInContext(js.slice(0,js.indexOf('function renderActual')),context);
vm.runInContext("today='2026-11-12'",context);
const call=(name,value)=>{context.input=value;return vm.runInContext(name+'(input)',context);};
for(const d of ['2026-02-29','2026-09-31','2026-13-01','2026-00-10','<script>','2026-11-12T00:00:00Z',null,{},42])assert.equal(call('validDate',d),false);
assert.equal(call('validDate','2028-02-29'),true);
const good={miles:13000,date:'2026-11-12'};
assert.equal(call('decodeReading',JSON.stringify(good)).miles,13000);
for(const raw of ['{', 'null', '[]', '"text"',' '.repeat(257),JSON.stringify({...good,miles:'=1+1'}),JSON.stringify({...good,miles:-1}),JSON.stringify({...good,miles:13000.5}),JSON.stringify({...good,date:'2026-09-31'}),JSON.stringify({...good,date:'2026-11-13'}),JSON.stringify({...good,date:'2026-08-09'}),JSON.stringify({...good,extra:'<img onerror=alert(1)>'}),'{"miles":13000,"date":"2026-11-12","__proto__":{"polluted":true}}'])assert.equal(call('decodeReading',raw),null);
for(const [d,n] of [['2026-08-09',10994],['2026-08-10',10994],['2026-11-12',13568],['2030-08-10',50994],['2031-08-10',50994]])assert.equal(Math.round(call('targetAt',d).target),n);
for(const file of ['app.js','styles.css']){
 const hash='sha256-'+createHash('sha256').update(readFileSync(new URL(file,root))).digest('base64');
 assert.ok(html.includes(`integrity="${hash}"`));
 if(file==='app.js')assert.ok(html.includes(`script-src '${hash}'`));
}
for(const directive of ["default-src 'none'","connect-src 'none'","form-action 'none'","base-uri 'none'","object-src 'none'","script-src-attr 'none'","style-src-attr 'none'"])assert.ok(html.includes(directive));
assert.ok(!/\sstyle=|\son\w+=|<style[\s>]/i.test(html));
assert.ok(!/innerHTML|outerHTML|document\.write|\beval\s*\(|new Function|\bfetch\s*\(|XMLHttpRequest|WebSocket/.test(js));
new vm.Script(js);
console.log('Passed: invalid/tampered storage, calendar dates, mileage boundaries, CSP, integrity and unsafe-sink checks.');
