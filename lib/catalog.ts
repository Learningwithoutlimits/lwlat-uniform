export type CatalogueProduct = {
  id: string;
  name: string;
  model: string;
  category: string;
  price: number;
  image: string;
  note?: string;
  embroidery?: number;
  variants: { sku: string; size: string; stock: number }[];
};

export const catalogue: CatalogueProduct[] = [
  { id:"polo", name:"Aircool Polo Shirt", model:"R288", category:"Tops", price:9.95, image:"/products/polo.jpg", embroidery:1.99, variants:[
    ["XWR288XXS","XXS",8],["XWR288XS","XS",8],["XWR288S","S",18],["XWR288M","M",24],["XWR288L","L",24],["XWR288XL","XL",20],["XWR288XXL","2XL",16],["XWR2883XL","3XL",10],["XWR2884XL","4XL",6],["XWR2885XL","5XL",4]
  ].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"fleece", name:"Full-Zip Fleece", model:"F205", category:"Outerwear", price:16.20, image:"/products/fleece.jpg", embroidery:1.99, variants:[
    ["XWF20511","XS",3],["XWF20509","S",6],["XWF20508","M",15],["XWF20507","L",17],["XWF20510","XL",9],["XWF20512","2XL",7],["XWF20513","3XL",3]
  ].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"sorrento", name:"Sorrento Zip-Neck Sweatshirt", model:"B309", category:"Tops", price:15.69, image:"/products/sorrento.jpg", embroidery:1.99, variants:[
    ["XWB30903","S",6],["XWB30902","M",14],["XWB30901","L",14],["XWB30904","XL",10],["XWB30905","2XL",7],["XWB30906","3XL",3]
  ].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"softshell", name:"Softshell Jacket", model:"TK20", category:"Outerwear", price:17.85, image:"/products/softshell.jpg", embroidery:1.99, variants:[
    ["XWTK2011","S",4],["XWTK2010","M",6],["XWTK2009","L",12],["XWTK2012","XL",8],["XWTK2013","2XL",6],["XWTK2014","3XL",4],["XWTK2007","4XL",2],["XWTK2008","5XL",2]
  ].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"jacket", name:"3-in-1 Jacket", model:"S553", category:"Outerwear", price:58.10, image:"/products/jacket.jpg", note:"Requires embroidery on the inner and outer jacket.", embroidery:3.98, variants:[
    ["XWS55304","S",3],["XWS55303","M",4],["XWS55302","L",7],["XWS55305","XL",5],["XWS55306","2XL",4],["XWS55307","3XL",4],["XWS55301","4XL",2]
  ].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"gilet", name:"KX3 Softshell Gilet", model:"KX3", category:"Outerwear", price:39.95, image:"/products/gilet.jpg", embroidery:1.99, variants:[
    ["XWKX36303","S",3],["XWKX36302","M",4],["XWKX36301","L",4],["XWKX36304","XL",4],["XWKX36305","2XL",3],["XWKX36306","3XL",3]
  ].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"trousers", name:"WX2 Stretch Trousers", model:"CD883", category:"Site team", price:21.85, image:"/products/trousers.jpg", note:"Standard issue trousers for site teams.", variants:[28,30,32,34,36,38,40,42,44,46,48].map((size,i)=>({sku:`XWCD883${String(i+1).padStart(2,"0")}`,size:String(size),stock:i===3?9:4})) },
  { id:"work-trousers", name:"PW3 Holster Work Trousers", model:"T602", category:"Site team", price:26.85, image:"/products/work-trousers.jpg", note:"Optional wider fit through the leg.", variants:[28,30,32,33,34,36,38,40,41,42,44,46,48].map((size,i)=>({sku:`XWT602${String(i+1).padStart(2,"0")}`,size:String(size),stock:4})) },
  { id:"shorts", name:"PW3 Holster Work Shorts", model:"PW345", category:"Site team", price:24.90, image:"/products/shorts.jpg", variants:[28,30,32,33,34,36,38,40,41,42,44].map((size,i)=>({sku:`XWPW345${String(i+1).padStart(2,"0")}`,size:String(size),stock:4})) },
  { id:"tabard", name:"Tabard with Pocket", model:"S843", category:"Catering", price:9.50, image:"/products/tabard.jpg", variants:[["XWS84305","S/M",10],["XWS84304","L/XL",14],["XWS84306","2XL",7]].map(([sku,size,stock])=>({sku:String(sku),size:String(size),stock:Number(stock)})) },
  { id:"chef-short", name:"Short-Sleeved Chef's Jacket", model:"C738", category:"Catering", price:15.95, image:"/products/chef-short.jpg", variants:["S","M","L","XL","2XL","3XL"].map((size,i)=>({sku:`XWC738${[3,2,1,4,5,6][i].toString().padStart(2,"0")}`,size,stock:[4,7,9,7,8,3][i]})) },
  { id:"chef-long", name:"Long-Sleeved Chef's Jacket", model:"C838", category:"Catering", price:18.29, image:"/products/chef-long.jpg", variants:["S","M","L","XL","2XL","3XL"].map((size,i)=>({sku:`XWC838${[3,2,1,4,5,6][i].toString().padStart(2,"0")}`,size,stock:[2,3,3,2,3,2][i]})) },
  { id:"chef-trousers", name:"Surrey Chef's Trousers", model:"C072", category:"Catering", price:17.90, image:"/products/chef-trousers.jpg", variants:["S","M","L","XL","2XL","3XL"].map((size,i)=>({sku:`XWC072${[3,2,1,4,5,6][i].toString().padStart(2,"0")}`,size,stock:[8,18,18,10,10,4][i]})) },
  { id:"apron", name:"Bib Apron with Pocket", model:"PR154", category:"Catering", price:14.12, image:"/products/apron.jpg", variants:[{sku:"XWPR154",size:"One size",stock:30}] },
  { id:"shoes", name:"K-Road Safety Shoes", model:"B1000", category:"Site team", price:96.74, image:"/products/shoes.jpg", variants:[3,4,5,6,6.5,7,8,9,10,10.5,11,12,13].map((size,i)=>({sku:`XWB1000${String(i+1).padStart(2,"0")}`,size:`UK ${size}`,stock:3})) },
  { id:"shirt-long-men", name:"Men's Oxford Long-Sleeved Shirt", model:"KK105", category:"Shirts", price:20.62, image:"/products/shirt-men.jpg", embroidery:1.99, variants:["14.5 (36/38\")","15 (39\")","15.5 (40\")","16 (41\")","16.5 (42\")","17 (43\")","17.5 (44\")","18 (45\")","18.5 (46/48\")","19 (49\")","19.5 (50/52\")","20 (54/56\")","21 (58/60\")","22 (62/64\")","23 (66/68\")"].map((size,i)=>({sku:`XWKK105${String(i+1).padStart(2,"0")}`,size,stock:8})) },
  { id:"shirt-long-women", name:"Women's Oxford Long-Sleeved Shirt", model:"KK702", category:"Shirts", price:20.62, image:"/products/shirt-women.jpg", embroidery:1.99, variants:[6,8,10,12,14,16,18,20,22,24,26,28].map((size,i)=>({sku:`XWKK702${String(i+1).padStart(2,"0")}`,size:`${size} (${28+i*2}\")`,stock:8})) },
  { id:"shirt-short-men", name:"Men's Oxford Short-Sleeved Shirt", model:"KK109", category:"Shirts", price:19.05, image:"/products/shirt-short-men.jpg", embroidery:1.99, variants:["14.5 (36/38\")","15 (39\")","15.5 (40\")","16 (41\")","16.5 (42\")","17 (43\")","17.5 (44\")","18 (45\")","18.5 (46/48\")","19 (49\")","19.5 (50/52\")","20 (54/56\")","21 (58/60\")","22 (62/64\")","23 (66/68\")"].map((size,i)=>({sku:`XWKK109${String(i+1).padStart(2,"0")}`,size,stock:8})) },
  { id:"shirt-short-women", name:"Women's Oxford Short-Sleeved Shirt", model:"KK701", category:"Shirts", price:19.05, image:"/products/shirt-short-women.jpg", embroidery:1.99, variants:[6,8,10,12,14,16,18,20,22,24,26,28].map((size,i)=>({sku:`XWKK701${String(i+1).padStart(2,"0")}`,size:`${size} (${28+i*2}\")`,stock:8})) },
  { id:"bandana", name:"Chef's Bandana", model:"PR658", category:"Catering", price:5.77, image:"/products/hair-covering.jpg", variants:[{sku:"XWPR658",size:"One size",stock:8}] },
  { id:"skull-cap", name:"Chef's Skull Cap", model:"PR653", category:"Catering", price:5.38, image:"/products/hair-covering.jpg", variants:[{sku:"XWPR653",size:"One size",stock:8}] },
];

export const lowStockThreshold = 5;
