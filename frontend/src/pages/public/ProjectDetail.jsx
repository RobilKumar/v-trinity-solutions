import React,{useEffect,useState}from'react';import{useParams,Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress,Chip}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
export default function ProjectDetail(){const{slug}=useParams();const[proj,setProj]=useState(null);const[loading,setLoading]=useState(true);
useEffect(()=>{setLoading(true);api.get(`/projects/${slug}`).then(r=>setProj(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[slug]);
if(loading)return<div className="flex justify-center items-center min-h-screen"><CircularProgress/></div>;
if(!proj)return<div className="text-center py-32"><h2 className="text-2xl text-gray-500">Project not found</h2><Link to="/projects" className="text-primary-500 mt-4 inline-block">← Back</Link></div>;
const techs=proj.Technologies?JSON.parse(proj.Technologies):[];
return(<><Helmet><title>{proj.ProjectName} – V-Trinity Solutions Portfolio</title></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}><div className="container-xl py-16"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
<div className="text-secondary-500 text-sm font-semibold uppercase mb-2">{proj.IndustryName}</div>
<h1 className="text-4xl md:text-5xl font-bold font-heading text-white mb-4">{proj.ProjectName}</h1>
<div className="flex flex-wrap gap-4 text-gray-300 text-sm">{proj.ClientName&&<span>👤 {proj.ClientName}</span>}{proj.Location&&<span>📍 {proj.Location}</span>}{proj.CompletionDate&&<span>📅 {new Date(proj.CompletionDate).getFullYear()}</span>}</div>
</motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl">
{proj.BannerURL&&<img src={proj.BannerURL} alt={proj.ProjectName} className="w-full rounded-2xl mb-10 shadow-xl max-h-96 object-cover"/>}
<div className="grid lg:grid-cols-3 gap-10">
<div className="lg:col-span-2 space-y-8">
{proj.Description&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Overview</h2><p className="text-gray-600 leading-relaxed">{proj.Description}</p></div>}
{proj.Challenge&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Challenge</h2><p className="text-gray-600 leading-relaxed">{proj.Challenge}</p></div>}
{proj.Solution&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Our Solution</h2><p className="text-gray-600 leading-relaxed">{proj.Solution}</p></div>}
{proj.Results&&<div><h2 className="text-2xl font-bold text-dark-800 mb-3">Results</h2><p className="text-gray-600 leading-relaxed">{proj.Results}</p></div>}
{proj.gallery?.length>0&&<div><h2 className="text-2xl font-bold text-dark-800 mb-4">Project Gallery</h2><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{proj.gallery.map(g=><img key={g.GalleryID} src={g.FileURL} alt={g.Caption||proj.ProjectName} className="rounded-xl w-full h-40 object-cover"/>)}</div></div>}
</div>
<div><div className="bg-gray-50 rounded-2xl p-6 sticky top-24 space-y-4">
<h3 className="font-bold text-dark-800">Project Details</h3>
{[['Industry',proj.IndustryName],['Client',proj.ClientName],['Location',proj.Location],['Completed',proj.CompletionDate&&new Date(proj.CompletionDate).toLocaleDateString('en-US',{month:'long',year:'numeric'})]].filter(([,v])=>v).map(([k,v])=><div key={k}><div className="text-xs text-gray-400 uppercase font-semibold">{k}</div><div className="text-dark-800 font-medium text-sm">{v}</div></div>)}
{techs.length>0&&<div><div className="text-xs text-gray-400 uppercase font-semibold mb-2">Technologies</div><div className="flex flex-wrap gap-1">{techs.map(t=><Chip key={t} label={t} size="small" variant="outlined"/>)}</div></div>}
<Link to="/request-solution" className="btn-primary block text-center mt-4">Start Similar Project</Link>
</div></div></div></div></div></>);}


