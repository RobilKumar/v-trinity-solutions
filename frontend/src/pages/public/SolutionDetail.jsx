import React,{useEffect,useState}from'react';import{useParams,Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
export default function SolutionDetail(){const{slug}=useParams();const[sol,setSol]=useState(null);const[loading,setLoading]=useState(true);
useEffect(()=>{api.get(`/solutions/${slug}`).then(r=>setSol(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[slug]);
if(loading)return<div className="flex justify-center items-center min-h-screen"><CircularProgress/></div>;
if(!sol)return<div className="text-center py-32"><h2 className="text-2xl text-gray-500">Solution not found</h2><Link to="/solutions" className="text-primary-500 mt-4 inline-block">← Back</Link></div>;
const features=sol.KeyFeatures?JSON.parse(sol.KeyFeatures):[];
const usecases=sol.UseCases?JSON.parse(sol.UseCases):[];
return(<><Helmet><title>{sol.Title} – V-Trinity Solutions</title><meta name="description" content={sol.ShortDesc}/></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}><div className="container-xl py-16"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
<h1 className="text-5xl font-bold font-heading text-white mb-4">{sol.Title}</h1>
<p className="text-gray-300 text-lg max-w-2xl">{sol.ShortDesc}</p>
<Link to="/request-solution" className="btn-primary mt-6 inline-flex">Request This Solution →</Link>
</motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl">
<div className="grid lg:grid-cols-3 gap-10">
<div className="lg:col-span-2">
<div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{__html:sol.FullDesc||'<p>'+sol.ShortDesc+'</p>'}}/>
{features.length>0&&<div className="mt-10"><h2 className="text-2xl font-bold text-dark-800 mb-4">Key Features</h2><ul className="space-y-2">{features.map((f,i)=><li key={i} className="flex items-start gap-3"><span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</span><span className="text-gray-700">{f}</span></li>)}</ul></div>}
{usecases.length>0&&<div className="mt-10"><h2 className="text-2xl font-bold text-dark-800 mb-4">Use Cases</h2><div className="grid sm:grid-cols-2 gap-3">{usecases.map((u,i)=><div key={i} className="p-4 rounded-xl bg-gray-50 border border-gray-100"><div className="font-medium text-dark-800 text-sm">{u}</div></div>)}</div></div>}
</div>
<div><div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
<h3 className="font-bold text-dark-800 mb-4">Interested in this solution?</h3>
<p className="text-gray-500 text-sm mb-5">Talk to our experts and get a customized implementation plan.</p>
<Link to="/request-solution" className="btn-primary block text-center mb-3">Request a Quote</Link>
<Link to="/contact" className="block text-center text-primary-500 text-sm font-medium">Contact an Expert</Link>
</div></div></div></div></div></>);}


