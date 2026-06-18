import React,{useEffect,useState}from'react';import{Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress,Chip}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
export default function Careers(){const[jobs,setJobs]=useState([]);const[loading,setLoading]=useState(true);const[filter,setFilter]=useState('');
useEffect(()=>{api.get(`/careers${filter?`?type=${filter}`:''}`).then(r=>setJobs(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[filter]);
const types=['full-time','part-time','contract','remote'];
return(<><Helmet><title>Careers – V-Trinity Solutions</title></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}><div className="container-xl py-16 text-center"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}><span className="text-secondary-500 font-semibold text-sm uppercase tracking-widest">Join Our Team</span><h1 className="text-5xl font-bold font-heading text-white mt-3 mb-4">Career Opportunities</h1><p className="text-gray-300 text-lg max-w-xl mx-auto">Build your career with one of the region's leading enterprise technology companies.</p></motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl">
<div className="flex flex-wrap gap-2 mb-8"><Chip label="All Types" clickable variant={!filter?'filled':'outlined'} color={!filter?'primary':'default'} onClick={()=>setFilter('')}/>{types.map(t=><Chip key={t} label={t} clickable variant={filter===t?'filled':'outlined'} color={filter===t?'primary':'default'} onClick={()=>setFilter(t)}/>)}</div>
{loading?<div className="text-center py-16"><CircularProgress/></div>:<>
{!jobs.length?<div className="text-center py-16"><div className="text-5xl mb-4">💼</div><h3 className="text-xl font-semibold text-dark-800">No open positions right now</h3><p className="text-gray-500 mt-2">Send your resume to careers@v-trinitysolutions.com for future opportunities.</p></div>:
<div className="space-y-4">{jobs.map((job,i)=><motion.div key={job.job_id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}>
<Link to={`/careers/${job.slug}`} className="block p-6 rounded-2xl border border-gray-100 hover:shadow-lg hover:border-primary-200 transition-all group">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
<div><div className="flex items-center gap-2 mb-1"><h3 className="font-bold text-dark-800 group-hover:text-primary-600 transition-colors">{job.title}</h3>{job.job_type&&<Chip label={job.job_type} size="small" color="primary" variant="outlined"/>}</div><div className="text-gray-500 text-sm flex items-center gap-3">{job.location&&<span>📍 {job.location}</span>}{job.experience_min&&<span>⏱ {job.experience_min}{job.experience_max?`-${job.experience_max}`:'+'}  yrs exp</span>}</div></div>
<span className="text-primary-500 font-medium text-sm flex-shrink-0">Apply Now →</span></div></Link></motion.div>)}</div>}
</>}</div></div></>);}



