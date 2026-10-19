"use client";
import { useEffect, useMemo, useState } from "react";

type Variant={sku:string;product_id:string;size:string;stock:number;threshold:number};
type Product={id:string;name:string;model:string;category:string;price:number;image:string;note?:string;variants:Variant[]};
type BasketItem={sku:string;productId:string;name:string;size:string;quantity:number;price:number;image:string};
type OrderItem={sku:string;product_name:string;size:string;quantity:number;unit_price:number};
type Order={id:string;staff_name:string;email:string;school:string;department:string;notes:string;status:string;total:number;created_at:string;items:OrderItem[]};
type Movement={id:string;sku:string;product_name:string;size:string;change:number;resulting_stock:number;reason:string;reference:string;created_at:string};
const schools=["Trust Central Team","Babington Academy","Lancaster Academy","South Wigston High School","Heatherbrook Primary Academy","Woodstock Primary Academy"];

export default function UniformShop(){
 const [products,setProducts]=useState<Product[]>([]),[orders,setOrders]=useState<Order[]>([]),[movements,setMovements]=useState<Movement[]>([]),[basket,setBasket]=useState<BasketItem[]>([]),[view,setView]=useState("shop"),[category,setCategory]=useState("All"),[search,setSearch]=useState(""),[loading,setLoading]=useState(true),[message,setMessage]=useState("");
 const [selected,setSelected]=useState<Product|null>(null),[size,setSize]=useState(""),[adminToken,setAdminToken]=useState("");
 async function load(token=adminToken){setLoading(true);const r=await fetch("/api/store",{headers:token?{authorization:`Bearer ${token}`}:{}});const d=await r.json();if(r.ok){const vars:Variant[]=d.variants;setProducts(d.products.map((p:any)=>({...p,variants:vars.filter(v=>v.product_id===p.id)})));setOrders(d.orders||[]);setMovements(d.movements||[])}else setMessage(d.error);setLoading(false)}
 useEffect(()=>{load()},[]);
 const filtered=useMemo(()=>products.filter(p=>(category==="All"||p.category===category)&&p.name.toLowerCase().includes(search.toLowerCase())),[products,category,search]);
 const basketCount=basket.reduce((a,b)=>a+b.quantity,0);
 function add(){if(!selected||!size)return;const v=selected.variants.find(v=>v.sku===size);if(!v)return;setBasket(old=>{const found=old.find(i=>i.sku===v.sku);return found?old.map(i=>i.sku===v.sku?{...i,quantity:Math.min(v.stock,i.quantity+1)}:i):[...old,{sku:v.sku,productId:selected.id,name:selected.name,size:v.size,quantity:1,price:selected.price,image:selected.image}]});setSelected(null);setSize("");}
 if(view==="admin")return <Admin products={products} orders={orders} movements={movements} reload={load} close={()=>setView("shop")} token={adminToken} setToken={setAdminToken}/>;
 if(view==="checkout")return <Checkout basket={basket} setBasket={setBasket} back={()=>setView("shop")} done={(id)=>{setBasket([]);setMessage(`Order ${id} has been submitted.`);setView("shop")}}/>;
 return <div className="site-shell">
  <header><button className="brand" onClick={()=>setView("shop")} aria-label="Learning without Limits Academy Trust uniform shop home"><strong>Learning without Limits Academy Trust</strong><span>STAFF UNIFORM SHOP</span></button><nav aria-label="Main navigation"><a href="#range">Shop</a><a href="#how">How it works</a><button onClick={()=>setView("admin")}>Stock admin</button></nav><button className="basket" disabled={!basket.length} onClick={()=>setView("checkout")} aria-label={`Basket with ${basketCount} items`}>Basket <b>{basketCount}</b></button></header>
  {message&&<div className="notice">✓ {message}<button onClick={()=>setMessage("")}>×</button></div>}
  <main>
   <section className="hero"><div className="hero-copy"><span className="eyebrow">LwLAT staff clothing</span><h1>Uniform made simple.</h1><p>Choose your approved LwLAT clothing and submit your order. The Trust will arrange payment.</p><div className="hero-actions"><a className="primary" href="#range">Shop the range →</a><a href="#how">How ordering works</a></div><div className="brand-stripes"><i/><i/><i/><i/><i/><i/></div></div><div className="hero-products"><img src="/products/polo-hero.png" alt="Aircool polo shirt"/><img src="/products/fleece-hero.png" alt="Full-zip fleece"/><img src="/products/jacket-hero.png" alt="Three-in-one jacket"/></div></section>
   <section className="benefits"><div><b>£</b><span><strong>Trust funded</strong><small>No payment is taken</small></span></div><div><b>✓</b><span><strong>Approved range</strong><small>Supplied by Polycopy</small></span></div><div><b>⌁</b><span><strong>Simple ordering</strong><small>Choose, submit and track</small></span></div></section>
   <section className="ordering-guide" id="how">
    <div className="guide-intro"><span className="eyebrow">A SIMPLE STAFF PROCESS</span><h2>How ordering works</h2><p>Select what you need and send the order to the Trust. You will not be asked to enter payment details.</p></div>
    <div className="guide-steps">
     <article><b>1</b><div><h3>Choose your clothing</h3><p>Browse the approved Polycopy range, open an item and select the size you need.</p></div></article>
     <article><b>2</b><div><h3>Review your basket</h3><p>Add each item to your basket and check the garment, size and quantity before continuing.</p></div></article>
     <article><b>3</b><div><h3>Submit your details</h3><p>Enter your name, work email, school or team and department, then submit the order.</p></div></article>
     <article><b>4</b><div><h3>The Trust arranges the order</h3><p>The central team reviews the request and arranges payment with Polycopy. You will be told when your clothing is ready and how it will reach you.</p></div></article>
    </div>
    <div className="guide-note"><strong>No staff payment required</strong><span>Learning without Limits Academy Trust pays for approved orders.</span><a href="#range">Start an order →</a></div>
   </section>
   <section className="range" id="range"><div className="range-head"><div><span className="eyebrow">POLYCOPY COLLECTION</span><h2>Staff clothing range</h2><p className="result-count">{filtered.length} {filtered.length===1?"item":"items"} available</p></div><label className="search"><span aria-hidden="true">⌕</span><input aria-label="Search clothing" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search clothing"/></label></div>
    <div className="filters">{["All","Tops","Shirts","Outerwear","Site team","Catering"].map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    {loading?<div className="loading">Loading the clothing range…</div>:<div className="product-grid">{filtered.map((p,i)=><article className={`product-card accent-${i%5}`} key={p.id}><div className="product-image"><img src={p.image} alt={p.name}/><span className={p.variants.some(v=>v.stock<=v.threshold)?"low":"stock"}>{p.variants.some(v=>v.stock<=v.threshold)?"Some sizes low":"In stock"}</span></div><div className="product-body"><small>{p.category} · {p.model}</small><h3>{p.name}</h3><p>{p.note||`Available in ${p.variants.length} sizes.`}</p><div className="product-action"><button onClick={()=>{setSelected(p);setSize("")}}>Choose item →</button></div></div></article>)}</div>}
   </section>
  </main>
  <footer><strong>Learning without Limits Academy Trust</strong><span>Winning hearts and inspiring minds to learn without limits.</span><small>Clothing supplied by Polycopy</small></footer>
  {selected&&<div className="modal-backdrop" onMouseDown={()=>setSelected(null)}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="item-title" onMouseDown={e=>e.stopPropagation()}><button className="modal-close" aria-label="Close item details" onClick={()=>setSelected(null)}>×</button><img src={selected.image} alt=""/><div><span className="eyebrow">{selected.model}</span><h2 id="item-title">{selected.name}</h2><p>{selected.note||"Approved LwLAT staff clothing supplied by Polycopy."}</p><label>Select size<select value={size} onChange={e=>setSize(e.target.value)}><option value="">Choose a size</option>{selected.variants.map(v=><option value={v.sku} disabled={!v.stock} key={v.sku}>{v.size} · {v.stock?v.stock+" available":"Out of stock"}</option>)}</select></label><button className="primary full" disabled={!size} onClick={add}>Add to basket</button></div></section></div>}
 </div>
}

function Checkout({basket,setBasket,back,done}:{basket:BasketItem[];setBasket:React.Dispatch<React.SetStateAction<BasketItem[]>>;back:()=>void;done:(id:string)=>void}) {
 const [sending,setSending]=useState(false),[error,setError]=useState("");
 async function submit(e:any){e.preventDefault();setSending(true);setError("");const fd=new FormData(e.currentTarget);const customer=Object.fromEntries(fd.entries());const r=await fetch("/api/store",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"order",customer,items:basket})});const d=await r.json();setSending(false);if(r.ok)done(d.id);else setError(d.error)}
 function changeQuantity(sku:string,change:number){setBasket(items=>items.flatMap(item=>item.sku!==sku?[item]:item.quantity+change>0?[{...item,quantity:item.quantity+change}]:[]))}
 return <div className="checkout-page"><header><button className="brand" onClick={back}><strong>Learning without Limits Academy Trust</strong><span>STAFF UNIFORM SHOP</span></button></header><main className="checkout-wrap"><button className="back" onClick={back}>← Back to shop</button><div className="checkout-grid"><section><span className="eyebrow">STAFF ORDER</span><h1>Your details</h1><p>The Trust will arrange payment. Please use your work email address.</p>{error&&<div className="error">{error}</div>}<form id="order-form" onSubmit={submit}><label>Full name<input name="name" autoComplete="name" required/></label><label>Work email<input name="email" type="email" autoComplete="email" required/></label><label>School or team<select name="school" required><option value="">Choose your workplace</option>{schools.map(s=><option key={s}>{s}</option>)}</select></label><label>Department or role<input name="department" required/></label><label>Order notes<textarea name="notes" rows={3} placeholder="Optional information for the central team"/></label></form></section><aside><div className="summary-heading"><h2>Order summary</h2><span>{basket.reduce((total,item)=>total+item.quantity,0)} items</span></div>{basket.map(i=><div className="summary-item" key={i.sku}><img src={i.image} alt=""/><span><strong>{i.name}</strong><small>Size {i.size}</small><button className="remove-item" onClick={()=>setBasket(items=>items.filter(item=>item.sku!==i.sku))}>Remove</button></span><div className="quantity" aria-label={`Quantity for ${i.name}`}><button onClick={()=>changeQuantity(i.sku,-1)} aria-label="Reduce quantity">−</button><b>{i.quantity}</b><button onClick={()=>changeQuantity(i.sku,1)} aria-label="Increase quantity">+</button></div></div>)}<p className="funded">Your order will be paid for by Learning without Limits Academy Trust.</p><button form="order-form" className="primary full" disabled={sending||!basket.length}>{sending?"Submitting…":"Submit order"}</button></aside></div></main></div>
}

function Admin({products,orders,movements,reload,close,token,setToken}:{products:Product[];orders:Order[];movements:Movement[];reload:(token?:string)=>void;close:()=>void;token:string;setToken:(value:string)=>void}){
 const [code,setCode]=useState(""),[loginError,setLoginError]=useState(""),[working,setWorking]=useState(false),[reference,setReference]=useState(""),[reason,setReason]=useState("Stock delivery");
 const variants=products.flatMap(product=>product.variants.map(variant=>({...variant,product:product.name})));
 const low=variants.filter(variant=>variant.stock<=5);

 async function login(){
  setWorking(true);setLoginError("");
  const response=await fetch("/api/store",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"login",password:code})});
  const data=await response.json();setWorking(false);
  if(!response.ok){setLoginError(data.error||"Unable to sign in.");return}
  setToken(data.token);await reload(data.token);
 }
 async function update(payload:any){
  setWorking(true);
  const response=await fetch("/api/store",{method:"POST",headers:{"content-type":"application/json",authorization:`Bearer ${token}`},body:JSON.stringify(payload)});
  const data=await response.json();setWorking(false);
  if(response.status===401){setToken("");setLoginError("Your session expired. Please sign in again.");return}
  if(!response.ok){alert(data.error||"Unable to save the change.");return}
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

 if(!token)return <div className="admin-login"><section><button className="brand" onClick={close}><strong>Learning without Limits</strong><span>UNIFORM ADMIN</span></button><h1>Stock administration</h1><p>Enter the private administration password to view orders and stock.</p>{loginError&&<div className="error">{loginError}</div>}<input type="password" value={code} onChange={event=>setCode(event.target.value)} onKeyDown={event=>event.key==="Enter"&&login()} placeholder="Access password"/><button className="primary full" disabled={working||!code} onClick={login}>{working?"Checking…":"Continue"}</button><button className="link" onClick={close}>Return to shop</button></section></div>;

 return <div className="admin-page">
  <aside><div className="brand"><strong>LwLAT Uniform</strong><span>ADMINISTRATION</span></div><button className="active">Overview</button><button onClick={close}>View shop</button><button onClick={()=>setToken("")}>Sign out</button></aside>
  <main>
   <div className="admin-head"><div><span className="eyebrow">LIVE INVENTORY</span><h1>Uniform overview</h1></div><button onClick={()=>reload(token)}>Refresh data</button></div>
   <div className="stat-grid"><article><span>Open orders</span><strong>{orders.filter(order=>order.status!=="Completed").length}</strong></article><article className="warn"><span>At five or fewer</span><strong>{low.length}</strong></article><article><span>Total units</span><strong>{variants.reduce((total,variant)=>total+variant.stock,0)}</strong></article><article><span>Stock movements</span><strong>{movements.length}</strong></article></div>
   <section className="admin-panel">
    <div className="panel-title admin-tools"><div><h2>Recent orders</h2><span>{orders.length} orders</span></div><div><button onClick={exportDetailed} disabled={!orders.length}>Export for Excel</button><button onClick={exportPurchasing} disabled={!orders.some(order=>["Approved","Purchase order raised"].includes(order.status))}>Polycopy purchase list</button></div></div>
    <div className="table-wrap"><table><thead><tr><th>Reference</th><th>Staff member</th><th>School</th><th>Items</th><th>Status</th></tr></thead><tbody>{orders.length?orders.map(order=><tr key={order.id}><td><b>{order.id}</b><small>{new Date(order.created_at).toLocaleDateString("en-GB")}</small></td><td>{order.staff_name}<small>{order.email}</small></td><td>{order.school}<small>{order.department}</small></td><td>{order.items.reduce((total,item)=>total+item.quantity,0)}<small>{order.items.map(item=>`${item.product_name}, ${item.size} × ${item.quantity}`).join(" · ")}</small></td><td><select value={order.status} onChange={event=>update({action:"status",id:order.id,status:event.target.value})}><option>Submitted</option><option>Approved</option><option>Purchase order raised</option><option>Ordered</option><option>Ready</option><option>Completed</option></select></td></tr>):<tr><td colSpan={5}>No orders have been submitted yet.</td></tr>}</tbody></table></div>
   </section>
   <section className="admin-panel">
    <div className="panel-title delivery-head"><div><h2>Receive or adjust stock</h2><span>Low-stock warning level: 5 pieces</span></div><label>Reference<input value={reference} onChange={event=>setReference(event.target.value)} placeholder="PO or delivery note"/></label><label>Reason<select value={reason} onChange={event=>setReason(event.target.value)}><option>Stock delivery</option><option>Return</option><option>Damaged stock</option><option>Stock correction</option></select></label></div>
    <div className="stock-grid">{variants.map(variant=><StockRow key={variant.sku} variant={variant} reference={reference} reason={reason} working={working} update={update}/>)}</div>
   </section>
   <section className="admin-panel"><div className="panel-title"><h2>Stock movement history</h2><span>Latest 100 changes</span></div><div className="table-wrap"><table><thead><tr><th>Date</th><th>Item</th><th>Change</th><th>New stock</th><th>Reason</th><th>Reference</th></tr></thead><tbody>{movements.slice(0,100).map(movement=><tr key={movement.id}><td>{new Date(movement.created_at).toLocaleString("en-GB")}</td><td>{movement.product_name}<small>{movement.size} · {movement.sku}</small></td><td className={movement.change<0?"stock-minus":"stock-plus"}>{movement.change>0?"+":""}{movement.change}</td><td>{movement.resulting_stock}</td><td>{movement.reason}</td><td>{movement.reference||"—"}</td></tr>)}</tbody></table></div></section>
  </main>
 </div>
}

function StockRow({variant,reference,reason,working,update}:{variant:Variant&{product:string};reference:string;reason:string;working:boolean;update:(payload:any)=>void}){
 const [received,setReceived]=useState(""),[adjusted,setAdjusted]=useState(String(variant.stock));
 useEffect(()=>setAdjusted(String(variant.stock)),[variant.stock]);
 return <article className={variant.stock<=5?"stock-row stock-control low-row":"stock-row stock-control"}><div><strong>{variant.product}</strong><small>{variant.size} · {variant.sku}</small><em>{variant.stock} currently in stock</em></div><label>Delivery quantity<input type="number" min="1" value={received} onChange={event=>setReceived(event.target.value)} placeholder="0"/></label><button disabled={working||!received} onClick={()=>{update({action:"stock",sku:variant.sku,mode:"add",amount:received,reason,reference});setReceived("")}}>Add stock</button><label>Correct total<input type="number" min="0" value={adjusted} onChange={event=>setAdjusted(event.target.value)}/></label><button className="secondary-action" disabled={working||adjusted===String(variant.stock)} onClick={()=>update({action:"stock",sku:variant.sku,mode:"set",amount:adjusted,reason,reference})}>Save correction</button></article>
}
