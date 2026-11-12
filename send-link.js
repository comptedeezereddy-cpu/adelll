// Envoie au client son lien personnel par e-mail (Resend). Réservé aux comptes hôtel et administrateur.
// Variables Netlify : SUPABASE_URL, SUPABASE_SERVICE_KEY, RESEND_API_KEY, MAIL_FROM (facultatif)
const out=(c)=>({statusCode:c,body:"{}"});
const h=(t)=>String(t||"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
exports.handler=async(ev)=>{
 const U=process.env.SUPABASE_URL,K=process.env.SUPABASE_SERVICE_KEY;
 const me=await (await fetch(U+"/auth/v1/user",{headers:{apikey:K,Authorization:ev.headers.authorization||""}})).json();
 if(!me.id)return out(401);
 const pr=await (await fetch(U+"/rest/v1/profiles?select=role&user_id=eq."+me.id,{headers:{apikey:K}})).json();
 if(!pr[0]||!["hotel","admin"].includes(pr[0].role))return out(403);
 const {email,guest,hotel,url}=JSON.parse(ev.body||"{}");
 if(!email||!url||new URL(url).host!==ev.headers.host)return out(400);
 const r=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:"Bearer "+process.env.RESEND_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({
  from:process.env.MAIL_FROM||"onboarding@resend.dev",to:[email],subject:h(hotel)+" : vos services pendant votre séjour",
  html:`<p>Bonjour ${h(guest)},</p><p>${h(hotel)} vous propose des services pendant votre séjour : transferts, visites, restaurants, baby-sitting...</p><p><a href="${h(url)}">Accéder à mon espace</a></p><p>Ce lien est personnel, ne le partagez pas.</p>`})});
 return out(r.ok?200:400);
};
