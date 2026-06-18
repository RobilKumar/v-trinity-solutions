import React,{useEffect,useState}from'react';import{useParams,Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress,Chip}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
export default function ProjectDetail(){const{slug}=useParams();const[proj,setProj]=useState(null);const[loading,setLoading]=useState(true);
useEffect(()=>{setLoading(true);api.get(`/projects/${slug}`).then(r=>setProj(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[slug]);
if(loading)return<div className="flex justify-center items-center min-h-screen"><CircularProgress/></div>;
if(!proj)return<div className="text-center py-32"><h2 className="text-2xl text-gray-500">Project not found</h2><Link to="/projects" className="text-primary-500 mt-4 inline-block">← Back</Link></div>;
const techs=proj.technologies?JSON.parse(proj.technologies):[];
return(<><Helmet><title>{proj.project_name} – V-Trinity Solutions Portfolio</title></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}><div className="container-xl py-16"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
<div className="text-secondary-500 text-sm font-semibold uppercase mb-2">{proj.industry_name}</div>
<h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">{proj.project_name}</h1>
<div className="flex flex-wrap gap-4 text-gray-300 text-sm">{proj.client_name&&<span>👤 {proj.client_name}</span>}{proj.location&&<span>📍 {proj.location}</span>}{proj.completion_date&&<span>📅 {new Date(proj.completion_date).getFullYear()}</span>}</div>
</motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl">
{proj.banner_url&&<img src={proj.banner_url} alt={proj.project_name} className="w-full rounded-2xl mb-10 shadow-xl max-h-96 object-cover"/>}
<div className="grid lg:grid-cols-3 gap-10">
<div className="lg:col-span-2 space-y-8">
{proj.description&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Overview</h2><p className="text-gray-600 leading-relaxed">{proj.description}</p></div>}
{proj.challenge&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Challenge</h2><p className="text-gray-600 leading-relaxed">{proj.challenge}</p></div>}
{proj.solution&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Our Solution</h2><p className="text-gray-600 leading-relaxed">{proj.solution}</p></div>}
{proj.results&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Results</h2><p className="text-gray-600 leading-relaxed">{proj.results}</p></div>}
{proj.gallery?.length>0&&<div><h2 className="text-2xl font-bold text-dark-800 mb-4">Project Gallery</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{proj.gallery.map(g=><img key={g.file_id} src={g.file_url} alt={g.caption||proj.project_name} className="rounded-xl w-full h-40 object-cover"/>)}</div></div>}
</div>
<div><div className="bg-gray-50 rounded-2xl p-6 sticky top-24 space-y-4">
<h3 className="font-bold text-dark-800">Project Details</h3>
{[['Industry',proj.industry_name],['Client',proj.client_name],['Location',proj.location],['Completed',proj.completion_date&&new Date(proj.completion_date).toLocaleDateString('en-US',{month:'long',year:'numeric'})]].filter(([,v])=>v).map(([k,v])=><div key={k}><div className="text-xs text-gray-400 uppercase font-semibold">{k}</div><div className="text-dark-800 font-medium text-sm">{v}</div></div>)}
{techs.length>0&&<div><div className="text-xs text-gray-400 uppercase font-semibold mb-2">Technologies</div><div className="flex flex-wrap gap-1">{techs.map(t=><Chip key={t} label={t} size="small" variant="outlined"/>)}</div></div>}
<Link to="/request-solution" className="btn-primary block text-center mt-4">Start Similar Project</Link>
</div></div></div></div></div></>);}


