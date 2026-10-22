import { runNight } from "./info-sim";
const N=300; const prof:Record<string,{n:number,t:number,top:number,obj:number,mys:number}>={};
for(let i=0;i<N;i++){const r=runNight({seed:31000+i*11,absent:i%3,talks:10+i%7,secretShare:0.3,earn:0.85});
 const rows=r.standings.standings; const top=rows[0].total;
 for(const [,row] of rows.entries()){const p=r.profiles[row.guest];const e=prof[p]??={n:0,t:0,top:0,obj:0,mys:0};e.n++;e.t+=row.total;e.obj+=row.tiers.objectives;e.mys+=row.tiers.mysteries;if(row.total>=top-.001)e.top++;}}
for(const [p,e] of Object.entries(prof))console.log(p.padEnd(13),"mean",(e.t/e.n).toFixed(2),"obj",(e.obj/e.n).toFixed(2),"mys",(e.mys/e.n).toFixed(2),"top-share/1000",(1000*e.top/e.n).toFixed(0));
// per-seat objective weak spots and race wins
const seat:Record<string,{n:number,races:number,obj:Record<string,[number,number]>}>={};
for(let i=0;i<N;i++){const r=runNight({seed:52000+i*7,absent:i%3,talks:12,secretShare:0.3,earn:0.85,fixedProfile:"balanced"});
 for(const it of r.items.filter(x=>x.kind==="objective"&&x.itemId!=="race")){const s=seat[it.guest]??={n:0,races:0,obj:{}};const o=s.obj[it.itemId]??=[0,0];o[1]++;if(it.points>=it.max-.001)o[0]++;}
 for(const [c,w] of Object.entries(r.races)) if(w){const s=seat[w]??={n:0,races:0,obj:{}};s.races++;}}
for(const [g,s] of Object.entries(seat)){const w=Object.entries(s.obj).sort((a,b)=>a[1][0]/a[1][1]-b[1][0]/b[1][1])[0];console.log(g.padEnd(9),"race wins",(s.races/N*100).toFixed(0)+"%","hardest",w[0],(100*w[1][0]/w[1][1]).toFixed(0)+"%");}
