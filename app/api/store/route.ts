import { getStore } from "@netlify/blobs";
import { catalogue, openingStockReference, stockVersion } from "../../../lib/catalog";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Variant = {
  sku:string;
  product_id:string;
  size:string;
  stock:number;
  threshold:number;
  alerted:boolean;
};
type OrderItem = {
  sku:string;
  product_name:string;
  size:string;
  quantity:number;
  unit_price:number;
};
type Order = {
  id:string;
  staff_name:string;
  email:string;
  school:string;
  department:string;
  notes:string;
  status:string;
  total:number;
  created_at:string;
  items:OrderItem[];
};
type Movement = {
  id:string;
  sku:string;
  product_name:string;
  size:string;
  change:number;
  resulting_stock:number;
  reason:string;
  reference:string;
  created_at:string;
};
type State = {
  stockVersion?:string;
  products:Array<Omit<(typeof catalogue)[number],"variants">>;
  variants:Variant[];
  orders:Order[];
  movements:Movement[];
};

const store = () => getStore({name:"lwlat-uniform-shop",consistency:"strong"});

function initialState(orders:Order[]=[]):State {
  const created_at=new Date().toISOString();
  return {
    stockVersion,
    products:catalogue.map(({variants,...product})=>product),
    variants:catalogue.flatMap(product=>product.variants.map(variant=>({
      ...variant,
      product_id:product.id,
      threshold:5,
      alerted:false
    }))),
    orders,
    movements:catalogue.flatMap(product=>product.variants.filter(variant=>variant.stock>0).map(variant=>({
      id:crypto.randomUUID(),
      sku:variant.sku,
      product_name:product.name,
      size:variant.size,
      change:variant.stock,
      resulting_stock:variant.stock,
      reason:"Opening stock",
      reference:openingStockReference,
      created_at
    })))
  };
}

async function readState() {
  const blobs=store();
  let entry=await blobs.getWithMetadata("state",{type:"json",consistency:"strong"}) as {data:State;etag:string}|null;
  if(!entry){
    await blobs.setJSON("state",initialState(),{onlyIfNew:true});
    entry=await blobs.getWithMetadata("state",{type:"json",consistency:"strong"}) as {data:State;etag:string}|null;
  }
  if(!entry)throw new Error("Unable to initialise the stock database.");
  if(entry.data.stockVersion!==stockVersion){
    // A new opening stock count replaces the old figures. Orders are kept as a record.
    await blobs.setJSON("state",initialState(entry.data.orders||[]),{onlyIfMatch:entry.etag});
    return readState();
  }
  return {blobs,state:entry.data,etag:entry.etag};
}

async function mutate(change:(state:State)=>Promise<void>|void) {
  for(let attempt=0;attempt<4;attempt++){
    const {blobs,state,etag}=await readState();
    await change(state);
    const result=await blobs.setJSON("state",state,{onlyIfMatch:etag});
    if(result.modified)return state;
  }
  throw new Error("The stock changed at the same time. Please try again.");
}

const encoder=new TextEncoder();
function toBase64Url(bytes:Uint8Array){
  return Buffer.from(bytes).toString("base64url");
}
function adminPassword(){
  const password=process.env.ADMIN_PASSWORD;
  if(!password)throw new Error("The admin password has not been set up. Add ADMIN_PASSWORD in Netlify.");
  return password;
}
async function sign(value:string){
  const password=adminPassword();
  const key=await crypto.subtle.importKey("raw",encoder.encode(password),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  return toBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC",key,encoder.encode(value))));
}
async function makeToken(){
  const payload=toBase64Url(encoder.encode(JSON.stringify({exp:Date.now()+8*60*60*1000})));
  return `${payload}.${await sign(payload)}`;
}
async function isAdmin(request:Request){
  const token=request.headers.get("authorization")?.replace(/^Bearer\s+/,"");
  if(!token||!process.env.ADMIN_PASSWORD)return false;
  const [payload,signature]=token.split(".");
  if(!payload||!signature||await sign(payload)!==signature)return false;
  try{return JSON.parse(Buffer.from(payload,"base64url").toString()).exp>Date.now()}catch{return false}
}

async function sendLowStockAlert(items:Array<{name:string;size:string;stock:number;sku:string}>,request:Request){
  if(!items.length)return;
  const summary=items.map(item=>`${item.name} | Size ${item.size} | ${item.sku} | ${item.stock} remaining`).join("\n");
  const form=new URLSearchParams({
    "form-name":"low-stock-alert",
    subject:`LwLAT uniform stock alert: ${items.length} item${items.length===1?"":"s"} low`,
    alert:"One or more uniform items have reached five pieces or fewer.",
    items:summary,
    action:"Please open the uniform stock administration area to review or restock these items."
  });
  const response=await fetch(new URL("/__forms.html",request.url),{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body:form.toString()
  });
  if(!response.ok)throw new Error("Netlify did not accept the low-stock notification.");
}
async function sendOrderAlert(order:Order,request:Request){
  const itemSummary=order.items.map(item=>`${item.product_name} | Size ${item.size} | ${item.sku} | Quantity ${item.quantity}`).join("\n");
  const form=new URLSearchParams({
    "form-name":"new-uniform-order",
    subject:`New LwLAT uniform order: ${order.id}`,
    reference:order.id,
    date:new Date(order.created_at).toLocaleString("en-GB",{timeZone:"Europe/London"}),
    staff_name:order.staff_name,
    staff_email:order.email,
    school_or_team:order.school,
    department_or_role:order.department,
    items:itemSummary,
    notes:order.notes||"No additional notes"
  });
  const response=await fetch(new URL("/__forms.html",request.url),{
    method:"POST",
    headers:{"content-type":"application/x-www-form-urlencoded"},
    body:form.toString()
  });
  if(!response.ok)throw new Error("Netlify did not accept the order notification.");
}
function productName(state:State,productId:string){
  return state.products.find(product=>product.id===productId)?.name||"Uniform item";
}

export async function GET(request:Request) {
  try{
    const {state}=await readState();
    if(await isAdmin(request))return Response.json(state,{headers:{"cache-control":"no-store"}});
    const staffProducts=state.products.filter(product=>!product.adminOnly);
    const staffIds=new Set(staffProducts.map(product=>product.id));
    return Response.json({products:staffProducts.map(({price,embroidery,...product})=>product),variants:state.variants.filter(variant=>staffIds.has(variant.product_id)).map(({alerted,...variant})=>variant)},{headers:{"cache-control":"no-store"}});
  }catch(error){
    return Response.json({error:error instanceof Error?error.message:"Unable to load the shop."},{status:500});
  }
}

export async function POST(request:Request) {
  try{
    const body=await request.json() as any;
    if(body.action==="login"){
      const password=adminPassword();
      if(String(body.password)!==password)return Response.json({error:"The access code is incorrect."},{status:401});
      return Response.json({token:await makeToken()});
    }

    if(body.action==="order"){
      if(!body.customer?.name||!body.customer?.email||!body.customer?.school||!Array.isArray(body.items)||!body.items.length){
        return Response.json({error:"Please complete the order details."},{status:400});
      }
      const id=`LWL-${Date.now().toString(36).toUpperCase()}`;
      const newlyLow:Array<{name:string;size:string;stock:number;sku:string}>=[];
      let orderForAlert:Order|undefined;
      let total=0;
      await mutate(state=>{
        const items:OrderItem[]=[];
        for(const requested of body.items){
          const variant=state.variants.find(entry=>entry.sku===String(requested.sku));
          if(!variant)throw new Error(`The selected size for ${requested.name} is no longer available.`);
          const quantity=Math.max(1,Math.min(10,Number(requested.quantity)||1));
          if(variant.stock<quantity)throw new Error(`There is not enough stock for ${requested.name}.`);
          const product=state.products.find(entry=>entry.id===variant.product_id);
          if(!product||product.adminOnly)throw new Error("The selected product could not be found.");
          const previous=variant.stock;
          variant.stock-=quantity;
          total+=Number(product.price)*quantity;
          items.push({sku:variant.sku,product_name:product.name,size:variant.size,quantity,unit_price:Number(product.price)});
          if(variant.stock<=5&&!variant.alerted){
            variant.alerted=true;
            newlyLow.push({name:product.name,size:variant.size,stock:variant.stock,sku:variant.sku});
          }
          state.movements.unshift({id:crypto.randomUUID(),sku:variant.sku,product_name:product.name,size:variant.size,change:-quantity,resulting_stock:variant.stock,reason:"Staff order",reference:id,created_at:new Date().toISOString()});
        }
        orderForAlert={id,staff_name:String(body.customer.name),email:String(body.customer.email),school:String(body.customer.school),department:String(body.customer.department||"Not provided"),notes:String(body.customer.notes||""),status:"Submitted",total,created_at:new Date().toISOString(),items};
        state.orders.unshift(orderForAlert);
      });
      if(orderForAlert)await sendOrderAlert(orderForAlert,request).catch(()=>undefined);
      await sendLowStockAlert(newlyLow,request).catch(()=>undefined);
      return Response.json({ok:true,id},{status:201});
    }

    if(!await isAdmin(request))return Response.json({error:"Your admin session has expired."},{status:401});

    if(body.action==="status"){
      await mutate(state=>{
        const order=state.orders.find(entry=>entry.id===String(body.id));
        if(!order)throw new Error("Order not found.");
        order.status=String(body.status);
      });
      return Response.json({ok:true});
    }

    if(body.action==="stock"){
      const newlyLow:Array<{name:string;size:string;stock:number;sku:string}>=[];
      await mutate(state=>{
        const variant=state.variants.find(entry=>entry.sku===String(body.sku));
        if(!variant)throw new Error("Stock item not found.");
        const previous=variant.stock;
        const mode=String(body.mode||"set");
        const amount=Math.max(0,Number(body.amount)||0);
        variant.stock=mode==="add"?previous+amount:amount;
        variant.threshold=5;
        if(variant.stock>5)variant.alerted=false;
        const name=productName(state,variant.product_id);
        if(variant.stock<=5&&!variant.alerted){
          variant.alerted=true;
          newlyLow.push({name,size:variant.size,stock:variant.stock,sku:variant.sku});
        }
        state.movements.unshift({
          id:crypto.randomUUID(),
          sku:variant.sku,
          product_name:name,
          size:variant.size,
          change:variant.stock-previous,
          resulting_stock:variant.stock,
          reason:String(body.reason||(mode==="add"?"Stock delivery":"Stock adjustment")),
          reference:String(body.reference||""),
          created_at:new Date().toISOString()
        });
      });
      await sendLowStockAlert(newlyLow,request).catch(()=>undefined);
      return Response.json({ok:true});
    }

    return Response.json({error:"Unsupported action."},{status:400});
  }catch(error){
    const message=error instanceof Error?error.message:"Unable to save the change.";
    return Response.json({error:message},{status:message.includes("not enough")?409:500});
  }
}
