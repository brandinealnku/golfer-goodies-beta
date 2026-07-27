import { BASELINE } from './baseline.js';
const KEY='gg-beta-state-v3', ROLE='gg-beta-role', VERSION=3;
const clone=x=>JSON.parse(JSON.stringify(x));
export const currency=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n)||0);
async function loadFiles(){
 const names=['courses','products','orders','users','promotions','course-applications','reviews','rewards'];
 if(location.protocol==='file:') return clone(BASELINE);
 try { const pairs=await Promise.all(names.map(async n=>[n,await (await fetch(`./data/${n}.json`)).json()])); return Object.fromEntries(pairs); }
 catch { return clone(BASELINE); }
}
export async function init(){
 let saved; try{saved=JSON.parse(localStorage.getItem(KEY))}catch{}
 if(!saved||saved.schemaVersion!==VERSION){const base=await loadFiles(); saved={schemaVersion:VERSION,...base,cart:{courseId:null,items:[],tip:0,fulfillment:'Deliver to my hole',location:'Hole 1'}}; save(saved)}
 return saved;
}
export const get=()=>JSON.parse(localStorage.getItem(KEY)||'null');
export const save=s=>{localStorage.setItem(KEY,JSON.stringify(s)); window.dispatchEvent(new CustomEvent('gg-state',{detail:s})); return s};
export const update=fn=>{const s=get(); fn(s); return save(s)};
export async function reset(){localStorage.removeItem(KEY);localStorage.removeItem(ROLE);return init()}
export const role=()=>localStorage.getItem(ROLE)||'Golfer';
export const setRole=r=>{localStorage.setItem(ROLE,r);return r};
export function searchCourses(courses,q='',filters={}){q=q.toLowerCase();return courses.filter(c=>(c.name+' '+c.city+' '+c.state+' '+c.description).toLowerCase().includes(q)&&(!filters.open||c.open)&&(!filters.delivery||c.delivery)&&(!filters.turn||c.turnPickup)&&(!filters.clubhouse||c.clubhousePickup)&&(!filters.food||c.categories.includes('food'))&&(!filters.beverages||c.categories.includes('beverages'))&&(!filters.gear||c.categories.includes('gear'))&&(!filters.rated||c.rating>=4.7)&&(!filters.distance||c.distance<=Number(filters.distance)))}
export const filterProducts=(ps,q='',cat='All')=>ps.filter(p=>p.available&&(cat==='All'||p.category===cat)&&(p.name+' '+p.description).toLowerCase().includes(q.toLowerCase()));
export function totals(cart){const subtotal=cart.items.reduce((a,i)=>a+i.price*i.quantity,0),serviceFee=subtotal*.1,deliveryFee=cart.fulfillment.startsWith('Deliver')?3:0,tax=subtotal*.0825,tip=Number(cart.tip)||0;return {subtotal,serviceFee,deliveryFee,tax,tip,total:subtotal+serviceFee+deliveryFee+tax+tip}}
export function addToCart(s,p,quantity=1,options='',instructions=''){if(s.cart.courseId&&s.cart.courseId!==p.courseId)return {ok:false,reason:'One course per order'};s.cart.courseId=p.courseId;const found=s.cart.items.find(i=>i.productId===p.id&&i.options===options&&i.instructions===instructions);if(found)found.quantity+=quantity;else s.cart.items.push({productId:p.id,name:p.name,price:p.price,quantity,options,instructions});save(s);return {ok:true}}
export function submitOrder(s,details={}){if(!s.cart.items.length)throw Error('Cart is empty');const t=totals(s.cart),id='o'+Date.now(),order={id,number:'GG-'+String(Date.now()).slice(-5),courseId:s.cart.courseId,userId:'u1',createdAt:new Date().toISOString(),items:clone(s.cart.items),fulfillment:s.cart.fulfillment,location:s.cart.location,...t,status:'Order received',estimated:'20–25 min',runner:'Unassigned',staffNote:'',internalNote:'',demoContact:details};s.orders.unshift(order);for(const i of order.items){const p=s.products.find(x=>x.id===i.productId);if(p)p.inventory=Math.max(0,p.inventory-i.quantity)}s.rewards.points+=Math.floor(t.total);s.cart={courseId:null,items:[],tip:0,fulfillment:'Deliver to my hole',location:'Hole 1'};save(s);return order}
export function updateOrderStatus(s,id,status){const o=s.orders.find(x=>x.id===id);if(o)o.status=status;save(s);return o}
export {KEY,ROLE,VERSION};
