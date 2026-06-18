import React,{useEffect,useState}from'react';import{Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
const Icon=({value,className=''})=>{if(!value)return null;if(typeof value==='string'&&/^fa[srab]?\s+fa-/.test(value))return<i className={`${value} ${className}`}/>;return<span className={className}>{value}</span>;};
export default function Solutions(){const[solutions,setSolutions]=useState([]);const[loading,setLoading]=useState(true);
useEffect(()=>{api.get('/solutions').then(r=>setSolutions(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[]);
return(<><Helmet><title>Solutions – V-Trinity Solutions</title></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}><div className="container-xl py-16 text-center"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><span className="text-secondary-500 font-semibold text-sm uppercase tracking-widest">What We Offer</span><h1 className="text-5xl font-bold font-heading text-white mt-3 mb-4">Enterprise Solutions</h1><p className="text-gray-300 text-lg max-w-xl mx-auto">End-to-end technology solutions built for complex enterprise environments.</p></motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl">
{loading?<div className="text-center py-16"><CircularProgress/></div>:<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
{solutions.map((s,i)=><motion.div key={s.solution_id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.05}}>
<Link to={`/solutions/${s.slug}`} className="service-card block h-full">
<div className="icon-wrap"><Icon value={s.icon||'💡'}/></div>
<h3 className="text-lg font-semibold text-dark-800 mb-2">{s.title}</h3>
<p className="text-gray-500 text-sm leading-relaxed">{s.short_desc}</p>
<div className="mt-4 text-primary-500 font-medium text-sm">Explore solution →</div>
</Link></motion.div>)}
{!loading&&!solutions.length&&<div className="col-span-3 text-center py-16 text-gray-400">No solutions found.</div>}
</div>}</div></div></>);}


