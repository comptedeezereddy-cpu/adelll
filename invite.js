// Invite un hôtel ou un prestataire par e-mail (réservé à l'administrateur).
// Variables Netlify : SUPABASE_URL, SUPABASE_SERVICE_KEY
const out=(c,b)=>({statusCode:c,body:JSON.stringify(b||{})});
exports.handler=async(ev)=>{
 const U=process.env.SUPABASE_URL,K=process.env.SUPABASE_SERVICE_KEY,sk={apikey:K,"Content-Type":"application/json"};
 const me=await (await fetch(U+"/auth/v1/user",{headers:{apikey:K,Authorization:ev.headers.authorization||""}})).json();
 if(!me.id)return out(401);
 const pr=await (await fetch(U+"/rest/v1/profiles?select=role&user_id=eq."+me.id,{headers:sk})).json();
 if(!pr[0]||pr[0].role!=="admin")return out(403);
 const b=JSON.parse(ev.body||"{}");
 if(!["hotel","provider"].includes(b.role)||!b.email)return out(400);
 const u=await (await fetch(U+"/auth/v1/invite",{method:"POST",headers:sk,body:JSON.stringify({email:b.email})})).json();
 if(!u.id)return out(400,u);
 const r=await fetch(U+"/rest/v1/profiles",{method:"POST",headers:sk,body:JSON.stringify({user_id:u.id,role:b.role,hotel_id:b.hotel_id||null,provider_id:b.provider_id||null})});
 return out(r.ok?200:400);
};
