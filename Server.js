require('dotenv').config();
const express=require('express'),path=require('path'),cors=require('cors');
const app=express();const PORT=process.env.PORT||3000;
app.use(cors());app.use(express.json({limit:'200kb'}));
async function weather(c){try{const r=await fetch(`https://wttr.in/${c}?format=j1`);const j=await r.json();const cc=j.current_condition[0];return `${c}: ${cc.temp_C}C, ${cc.weatherDesc[0].value}, Humidity ${cc.humidity}%`;}catch{return null;}}
app.post('/api/chat',async(req,res)=>{
 try{
  let live=`Time: ${new Date().toLocaleString('hi-IN',{timeZone:'Asia/Kolkata'})} IST`;
  const last=req.body.messages?.slice(-1)[0]?.content||'';
  if(/mausam|weather|sitamarhi|patna|delhi/i.test(last)){const w=await weather('Sitamarhi');if(w) live+=` | LIVE WEATHER: ${w}`;}
  const clean=req.body.messages.slice(-12).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content).slice(0,3000)}));
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'content-type':'application/json','x-api-key':process.env.ANTHROPIC_API_KEY,'anthropic-version':'2023-06-01'},body:JSON.stringify({model:'claude-3-5-sonnet-20240620',max_tokens:1200,system:`Tum VICKY AI ho, Creator Vicky Kumar Takaur Sitamarhi. ${live}`,messages:clean})});
  const d=await r.json();if(!r.ok) return res.status(500).json({error:d.error?.message});
  res.json({reply:d.content.map(x=>x.text).join('')});
 }catch(e){res.status(500).json({error:'server error'});}
});
app.use(express.static(path.join(__dirname,'public')));
app.listen(PORT,()=>console.log('LIVE '+PORT));
