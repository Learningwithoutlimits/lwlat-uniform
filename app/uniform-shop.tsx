"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Variant={sku:string;product_id:string;size:string;stock:number;threshold:number};
type Product={id:string;name:string;model:string;category:string;price:number;image:string;note?:string;adminOnly?:boolean;variants:Variant[]};
type BasketItem={sku:string;productId:string;name:string;size:string;quantity:number;price:number;image:string};
type OrderItem={sku:string;product_name:string;size:string;quantity:number;unit_price:number};
type Order={id:string;staff_name:string;email:string;school:string;department:string;notes:string;status:string;total:number;created_at:string;items:OrderItem[]};
type Movement={id:string;sku:string;product_name:string;size:string;change:number;resulting_stock:number;reason:string;reference:string;created_at:string};
const schools=["Trust Central Team","Babington Academy","Lancaster Academy","South Wigston High School","Heatherbrook Primary Academy","Woodstock Primary Academy"];

const categories=["All","Tops","Shirts","Outerwear","Site team","Catering"];
const categoryColour:Record<string,string>={Tops:"var(--red)",Shirts:"var(--purple)",Outerwear:"var(--teal)","Site team":"var(--green)",Catering:"var(--yellow)"};
const steps=[
 ["Choose your clothing","Open an item and pick your size."],
 ["Check your basket","Change quantities or remove items."],
 ["Send your details","Your name, work email, school and department."],
 ["The Trust does the rest","The central team orders from Polycopy and tells you when your clothing is ready."]
];

function Icon({name}:{name:"search"|"check"|"close"|"bag"}){
 const paths={search:<><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></>,check:<path d="m5 12.5 4.5 4.5L19 7.5"/>,close:<path d="M6 6l12 12M18 6 6 18"/>,bag:<><path d="M5.5 8.5h13l-1 11.5h-11z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></>};
 return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

export default function UniformShop(){
 const [products,setProducts]=useState<Product[]>([]),[orders,setOrders]=useState<Order[]>([]),[movements,setMovements]=useState<Movement[]>([]),[basket,setBasket]=useState<BasketItem[]>([]),[view,setView]=useState("shop"),[category,setCategory]=useState("All"),[search,setSearch]=useState(""),[loading,setLoading]=useState(true),[message,setMessage]=useState(""),[loadError,setLoadError]=useState("");
 const [selected,setSelected]=useState<Product|null>(null),[size,setSize]=useState(""),[adminToken,setAdminToken]=useState(""),[added,setAdded]=useState("");
 const lastFocus=useRef<HTMLElement|null>(null);
 async function load(token=adminToken){setLoading(true);setLoadError("");try{const r=await fetch("/api/store",{headers:token?{authorization:`Bearer ${token}`}:{}});const d=await r.json();if(r.ok){const vars:Variant[]=d.variants;setProducts(d.products.map((p:any)=>({...p,variants:vars.filter(v=>v.product_id===p.id)})));setOrders(d.orders||[]);setMovements(d.movements||[])}else setLoadError(d.error||"The clothing range could not be loaded.")}catch{setLoadError("The clothing range could not be loaded. Check your connection and try again.")}setLoading(false)}
 useEffect(()=>{load()},[]);
 useEffect(()=>{if(!added)return;const timer=setTimeout(()=>setAdded(""),4500);return()=>clearTimeout(timer)},[added]);
 useEffect(()=>{
  if(!selected)return;
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")closeItem()};
  document.addEventListener("keydown",onKey);document.body.style.overflow="hidden";
  return()=>{document.removeEventListener("keydown",onKey);document.body.style.overflow=""};
 },[selected]);
 const inStock=(p:Product)=>p.variants.filter(v=>v.stock>0).length;
 const filtered=useMemo(()=>products.filter(p=>!p.adminOnly&&(category==="All"||p.category===category)&&`${p.name} ${p.model} ${p.category}`.toLowerCase().includes(search.trim().toLowerCase())).sort((a,b)=>Number(!inStock(a))-Number(!inStock(b))),[products,category,search]);
 const basketCount=basket.reduce((a,b)=>a+b.quantity,0);
 function openCheckout(){setAdded("");setView("checkout")}
 function openItem(p:Product,e:React.MouseEvent<HTMLElement>){lastFocus.current=e.currentTarget;setSelected(p);setSize("")}
 function closeItem(){setSelected(null);setSize("");lastFocus.current?.focus()}
 function add(){if(!selected||!size)return;const v=selected.variants.find(v=>v.sku===size);if(!v)return;setBasket(old=>{const found=old.find(i=>i.sku===v.sku);return found?old.map(i=>i.sku===v.sku?{...i,quantity:Math.min(v.stock,i.quantity+1)}:i):[...old,{sku:v.sku,productId:selected.id,name:selected.name,size:v.size,quantity:1,price:selected.price,image:selected.image}]});setAdded(`${selected.name}, size ${v.size}`);closeItem()}
 if(view==="admin")return <Admin products={products} orders={orders} movements={movements} reload={load} close={()=>setView("shop")} token={adminToken} setToken={setAdminToken}/>;
 if(view==="checkout")return <Checkout basket={basket} setBasket={setBasket} back={()=>setView("shop")} done={(id)=>{setBasket([]);setMessage(id);setView("shop");window.scrollTo(0,0)}}/>;
 return <div className="site-shell">
  <header className="site-header"><button className="brand" onClick={()=>setView("shop")} aria-label="Learning without Limits Academy Trust uniform shop home"><strong>Learning without Limits Academy Trust</strong><span>Staff uniform shop</span></button><nav aria-label="Main navigation"><a href="#range">Clothing</a><a href="#how">How it works</a><button onClick={()=>setView("admin")}>Stock admin</button></nav><button className="basket" disabled={!basket.length} onClick={openCheckout} aria-label={`Basket, ${basketCount} ${basketCount===1?"item":"items"}`}><Icon name="bag"/>Basket <b key={basketCount} className={basketCount?"bump":""}>{basketCount}</b></button></header>
  {message&&<div className="notice" role="status"><Icon name="check"/><div><strong>Order {message} has been sent.</strong><span>The central team will review it and tell you when your clothing is ready.</span></div><button onClick={()=>setMessage("")} aria-label="Dismiss message"><Icon name="close"/></button></div>}
  <main>
   <section className="hero">
    <div className="hero-copy"><h1>Order your staff clothing</h1><p>Choose from the approved Trust range, pick your sizes and send your order. The Trust pays for it, so you will not be asked for any payment details.</p><div className="hero-actions"><a className="primary" href="#range">Browse the range</a><a className="text-link" href="#how">How ordering works</a></div></div>
    <div className="hero-products" aria-hidden="true"><img src="/products/polo-hero.png" alt=""/><img src="/products/fleece-hero.png" alt=""/><img src="/products/jacket-hero.png" alt=""/></div>
    <div className="brand-stripes" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
   </section>
   <section className="steps" id="how" aria-labelledby="how-title"><h2 id="how-title" className="visually-hidden">How ordering works</h2><ol>{steps.map(([title,text],i)=><li key={title}><b>{i+1}</b><div><strong>{title}</strong><span>{text}</span></div></li>)}</ol></section>
   <section className="range" id="range" aria-labelledby="range-title">
    <div className="range-head"><div><h2 id="range-title">Clothing range</h2><p className="result-count" aria-live="polite">{loading?"Loading items":`${filtered.length} ${filtered.length===1?"item":"items"}`}</p></div><label className="search"><Icon name="search"/><input type="search" aria-label="Search clothing" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or code"/></label></div>
    <div className="filters" role="group" aria-label="Filter by category">{categories.map(c=><button key={c} aria-pressed={category===c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c!=="All"&&<i style={{background:categoryColour[c]}}/>}{c}</button>)}</div>
    {loadError?<div className="empty"><strong>The clothing range could not be loaded</strong><p>{loadError}</p><button className="primary" onClick={()=>load()}>Try again</button></div>
    :loading?<div className="product-grid" aria-hidden="true">{Array.from({length:8},(_,i)=><div className="product-card skeleton" key={i}><div className="product-image"/><div className="product-body"><span/><span/></div></div>)}</div>
    :filtered.length?<div className="product-grid">{filtered.map(p=>{const sizes=inStock(p);return <button className={sizes?"product-card":"product-card sold-out"} key={p.id} style={{"--cat":categoryColour[p.category]} as React.CSSProperties} onClick={e=>openItem(p,e)} aria-label={sizes?`${p.name}, choose a size`:`${p.name}, out of stock`}><span className="product-image"><img src={p.image} alt="" loading="lazy"/></span><span className="product-body"><small><i/>{p.category}</small><strong>{p.name}</strong><span>{sizes?sizes===p.variants.length?`${sizes} ${sizes===1?"size":"sizes"} in stock`:`In stock in ${sizes} of ${p.variants.length} sizes`:"Out of stock at the moment"}</span>{p.note&&<span>{p.note}</span>}<em>{sizes?"Choose size":"View sizes"}</em></span></button>})}</div>
    :<div className="empty"><strong>No clothing matches {search?`"${search}"`:"this filter"}</strong><p>Try a different word, or show the whole range.</p><button className="primary" onClick={()=>{setSearch("");setCategory("All")}}>Show all clothing</button></div>}
   </section>
  </main>
  <footer><div><strong>Learning without Limits Academy Trust</strong><span>Winning hearts and inspiring minds to learn without limits.</span></div><small>Clothing supplied by Polycopy. Orders are paid for by the Trust.</small></footer>
  {added&&<div className="toast" role="status"><Icon name="check"/><span>Added {added}</span><button onClick={openCheckout}>View basket</button></div>}
  {selected&&<div className="modal-backdrop" onMouseDown={closeItem}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="item-title" onMouseDown={e=>e.stopPropagation()} style={{"--cat":categoryColour[selected.category]} as React.CSSProperties}>
   <button className="modal-close" aria-label="Close item details" onClick={closeItem}><Icon name="close"/></button>
   <div className="modal-image"><img src={selected.image} alt=""/></div>
   <div className="modal-body"><small><i/>{selected.category}, model {selected.model}</small><h2 id="item-title">{selected.name}</h2><p>{selected.note||"Approved Trust staff clothing, supplied by Polycopy."}</p>
    <fieldset className="sizes"><legend>Choose a size</legend><div>{selected.variants.map((v,i)=><button key={v.sku} autoFocus={i===0&&!!v.stock} aria-pressed={size===v.sku} disabled={!v.stock} className={size===v.sku?"active":""} onClick={()=>setSize(v.sku)}><span>{v.size}</span>{!v.stock?<small>Out of stock</small>:v.stock<=v.threshold?<small>Few left</small>:null}</button>)}</div></fieldset>
    {selected.variants.some(v=>v.stock>0)?<button className="primary full" disabled={!size} onClick={add}>{size?"Add to basket":"Choose a size to continue"}</button>:<p className="sold-out-note">This item is out of stock. The central team will add it back once a new delivery arrives.</p>}
   </div>
  </section></div>}
 </div>
}

function Checkout({basket,setBasket,back,done}:{basket:BasketItem[];setBasket:React.Dispatch<React.SetStateAction<BasketItem[]>>;back:()=>void;done:(id:string)=>void}) {
 const [sending,setSending]=useState(false),[error,setError]=useState("");
 async function submit(e:any){e.preventDefault();setSending(true);setError("");const fd=new FormData(e.currentTarget);const customer=Object.fromEntries(fd.entries());try{const r=await fetch("/api/store",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"order",customer,items:basket})});const d=await r.json();if(r.ok)done(d.id);else setError(d.error||"The order could not be sent. Please try again.")}catch{setError("The order could not be sent. Check your connection and try again.")}setSending(false)}
 function changeQuantity(sku:string,change:number){setBasket(items=>items.flatMap(item=>item.sku!==sku?[item]:item.quantity+change>0?[{...item,quantity:item.quantity+change}]:[]))}
 const count=basket.reduce((total,item)=>total+item.quantity,0);
 return <div className="checkout-page"><header className="site-header"><button className="brand" onClick={back}><strong>Learning without Limits Academy Trust</strong><span>Staff uniform shop</span></button></header><main className="checkout-wrap"><button className="back" onClick={back}>Back to the clothing range</button><div className="checkout-grid">
  <section><h1>Your details</h1><p>We use these to send your order to the right school and to let you know when it is ready.</p>{error&&<div className="error" role="alert">{error}</div>}
   <form id="order-form" onSubmit={submit}>
    <label>Full name<input name="name" autoComplete="name" required/></label>
    <label>Work email<input name="email" type="email" autoComplete="email" required aria-describedby="email-help"/><small id="email-help">Use your school or Trust address.</small></label>
    <label>School or team<select name="school" required defaultValue=""><option value="" disabled>Choose your workplace</option>{schools.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Department or role<input name="department" required/></label>
    <label className="wide"><span>Order notes <span className="optional">(optional)</span></span><textarea name="notes" rows={3} placeholder="Anything the central team should know"/></label>
   </form>
  </section>
  <aside><div className="summary-heading"><h2>Your basket</h2><span>{count} {count===1?"item":"items"}</span></div>
   {basket.length?basket.map(i=><div className="summary-item" key={i.sku}><img src={i.image} alt=""/><span><strong>{i.name}</strong><small>Size {i.size}</small><button className="remove-item" onClick={()=>setBasket(items=>items.filter(item=>item.sku!==i.sku))}>Remove</button></span><div className="quantity" role="group" aria-label={`Quantity for ${i.name}`}><button onClick={()=>changeQuantity(i.sku,-1)} aria-label="Reduce quantity">−</button><b aria-live="polite">{i.quantity}</b><button onClick={()=>changeQuantity(i.sku,1)} aria-label="Increase quantity">+</button></div></div>)
   :<div className="empty small"><strong>Your basket is empty</strong><button className="text-link" onClick={back}>Go back and choose some clothing</button></div>}
   <p className="funded">The Trust pays for this order. You will not be asked for payment.</p><button form="order-form" className="primary full" disabled={sending||!basket.length}>{sending?"Sending your order…":"Send order"}</button></aside>
 </div></main></div>
}

function Admin({products,orders,movements,reload,close,token,setToken}:{products:Product[];orders:Order[];movements:Movement[];reload:(token?:string)=>void;close:()=>void;token:string;setToken:(value:string)=>void}){
 const [code,setCode]=useState(""),[loginError,setLoginError]=useState(""),[saveError,setSaveError]=useState(""),[working,setWorking]=useState(false),[reference,setReference]=useState(""),[reason,setReason]=useState("Stock delivery");
 const variants=products.flatMap(product=>product.variants.map(variant=>({...variant,product:product.name,adminOnly:product.adminOnly})));
 const low=variants.filter(variant=>variant.stock<=5);

 async function login(){
  setWorking(true);setLoginError("");
  const response=await fetch("/api/store",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"login",password:code})});
  const data=await response.json();setWorking(false);
  if(!response.ok){setLoginError(data.error||"Unable to sign in.");return}
  setToken(data.token);await reload(data.token);
 }
 async function update(payload:any){
  setWorking(true);setSaveError("");
  const response=await fetch("/api/store",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
  const data=await response.json();setWorking(false);
  if(response.status===401){setToken("");setLoginError("Your session expired. Please sign in again.");return}
  if(!response.ok){setSaveError(data.error||"The change could not be saved.");return}
  await reload(token);
 }
 function csvCell(value:unknown){return `"${String(value??"").replaceAll('"','""')}"`}
 function download(filename:string,rows:unknown[][]){
  const csv="\uFEFF"+rows.map(row=>row.map(csvCell).join(",")).join("\r\n");
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));link.download=filename;link.click();URL.revokeObjectURL(link.href);
 }
 function exportDetailed(){
  const rows:unknown[][]=[["Order reference","Date","Staff member","Email","School","Department","Status","Product","SKU","Size","Quantity","Unit price"]];
  orders.forEach(order=>order.items.forEach(item=>rows.push([order.id,new Date(order.created_at).toLocaleDateString("en-GB"),order.staff_name,order.email,order.school,order.department,order.status,item.product_name,item.sku,item.size,item.quantity,item.unit_price.toFixed(2)])));
  download("LwLAT-detailed-orders.csv",rows);
 }
 function exportPurchasing(){
  const totals=new Map<string,{product:string;sku:string;size:string;quantity:number}>();
  orders.filter(order=>["Approved","Purchase order raised"].includes(order.status)).forEach(order=>order.items.forEach(item=>{
   const current=totals.get(item.sku)||{product:item.product_name,sku:item.sku,size:item.size,quantity:0};current.quantity+=item.quantity;totals.set(item.sku,current);
  }));
  const rows:unknown[][]=[["Product","SKU","Size","Total required"],...[...totals.values()].sort((a,b)=>a.product.localeCompare(b.product)||a.size.localeCompare(b.size)).map(item=>[item.product,item.sku,item.size,item.quantity])];
  download("LwLAT-Polycopy-purchase-order.csv",rows);
 }

 if(!token)return <div className="admin-login"><section><button className="brand" onClick={close}><strong>Learning without Limits Academy Trust</strong><span>Uniform admin</span></button><h1>Stock administration</h1><p>Enter the private administration password to view orders and stock.</p>{loginError&&<div className="error">{loginError}</div>}<label className="visually-hidden" htmlFor="admin-password">Administration password</label><input id="admin-password" type="password" autoComplete="current-password" value={code} onChange={event=>setCode(event.target.value)} onKeyDown={event=>event.key==="Enter"&&login()} placeholder="Access password"/><button className="primary full" disabled={working||!code} onClick={login}>{working?"Checking…":"Continue"}</button><button className="link" onClick={close}>Return to shop</button></section></div>;

 return <div className="admin-page">
  <aside><div className="brand"><strong>LwLAT Uniform</strong><span>Administration</span></div><button className="active">Overview</button><button onClick={close}>View shop</button><button onClick={()=>setToken("")}>Sign out</button></aside>
  <main>
   <div className="admin-head"><div><h1>Uniform overview</h1></div><button onClick={()=>reload(token)}>Refresh data</button></div>
   {saveError&&<div className="error" role="alert">{saveError}</div>}
   <div className="stat-grid"><article><span>Open orders</span><strong>{orders.filter(order=>order.status!=="Completed").length}</strong></article><article className="warn"><span>At five or fewer</span><strong>{low.length}</strong></article><article><span>Total units</span><strong>{variants.reduce((total,variant)=>total+variant.stock,0)}</strong></article><article><span>Stock movements</span><strong>{movements.length}</strong></article></div>
   <section className="admin-panel">
    <div className="panel-title admin-tools"><div><h2>Recent orders</h2><span>{orders.length} orders</span></div><div><button onClick={exportDetailed} disabled={!orders.length}>Export for Excel</button><button onClick={exportPurchasing} disabled={!orders.some(order=>["Approved","Purchase order raised"].includes(order.status))}>Polycopy purchase list</button></div></div>
    <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Staff member</th><th>School</th><th>Items</th><th>Status</th></tr></thead><tbody>{orders.length?orders.map(order=><tr key={order.id}><td><b>{order.id}</b><small>{new Date(order.created_at).toLocaleDateString("en-GB")}</small></td><td>{order.staff_name}<small>{order.email}</small></td><td>{order.school}<small>{order.department}</small></td><td>{order.items.reduce((total,item)=>total+item.quantity,0)}<small>{order.items.map(item=>`${item.product_name}, ${item.size} × ${item.quantity}`).join(" · ")}</small></td><td><select value={order.status} onChange={event=>update({action:"status",id:order.id,status:event.target.value})}><option>Submitted</option><option>Approved</option><option>Purchase order raised</option><option>Ordered</option><option>Ready</option><option>Completed</option></select></td></tr>):<tr><td colSpan={5}>No orders have been submitted yet.</td></tr>}</tbody></table></div>
   </section>
   <section className="admin-panel">
    <div className="panel-title delivery-head"><div><h2>Receive or adjust stock</h2><span>Low-stock warning level: 5 pieces</span></div><label>Reference<input value={reference} onChange={event=>setReference(event.target.value)} placeholder="PO or delivery note"/></label><label>Reason<select value={reason} onChange={event=>setReason(event.target.value)}><option>Stock delivery</option><option>Return</option><option>Damaged stock</option><option>Stock correction</option></select></label></div>
    <div className="stock-grid">{variants.map(variant=><StockRow key={variant.sku} variant={variant} reference={reference} reason={reason} working={working} update={update}/>)}</div>
   </section>
   <section className="admin-panel"><div className="panel-title"><h2>Stock movement history</h2><span>Latest 100 changes</span></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Item</th><th>Change</th><th>New stock</th><th>Reason</th><th>Reference</th></tr></thead><tbody>{!movements.length&&<tr><td colSpan={6}>No stock changes have been recorded yet.</td></tr>}{movements.slice(0,100).map(movement=><tr key={movement.id}><td>{new Date(movement.created_at).toLocaleString("en-GB")}</td><td>{movement.product_name}<small>{movement.size} · {movement.sku}</small></td><td className={movement.change<0?"stock-minus":"stock-plus"}>{movement.change>0?"+":""}{movement.change}</td><td>{movement.resulting_stock}</td><td>{movement.reason}</td><td>{movement.reference||"—"}</td></tr>)}</tbody></table></div></section>
  </main>
 </div>
}

function StockRow({variant,reference,reason,working,update}:{variant:Variant&{product:string;adminOnly?:boolean};reference:string;reason:string;working:boolean;update:(payload:any)=>void}){
 const [received,setReceived]=useState(""),[adjusted,setAdjusted]=useState(String(variant.stock));
 useEffect(()=>setAdjusted(String(variant.stock)),[variant.stock]);
 return <article className={variant.stock<=5?"stock-row stock-control low-row":"stock-row stock-control"}><div><strong>{variant.product}</strong><small>{variant.size} · {variant.sku}{variant.adminOnly?" · Course clothing, not shown to staff":""}</small><em>{variant.stock} currently in stock</em></div><label>Delivery quantity<input type="number" min="1" value={received} onChange={event=>setReceived(event.target.value)} placeholder="0"/></label><button disabled={working||!received} onClick={()=>{update({action:"stock",sku:variant.sku,mode:"add",amount:received,reason,reference});setReceived("")}}>Add stock</button><label>Correct total<input type="number" min="0" value={adjusted} onChange={event=>setAdjusted(event.target.value)}/></label><button className="secondary-action" disabled={working||adjusted===String(variant.stock)} onClick={()=>update({action:"stock",sku:variant.sku,mode:"set",amount:adjusted,reason,reference})}>Save correction</button></article>
}
