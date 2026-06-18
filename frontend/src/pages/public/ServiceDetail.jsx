import React,{useEffect,useState}from'react';import{useParams,Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress,Accordion,AccordionSummary,AccordionDetails,Typography}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
export default function ServiceDetail(){const{slug}=useParams();const[svc,setSvc]=useState(null);const[loading,setLoading]=useState(true);
useEffect(()=>{setLoading(true);api.get(`/services/${slug}`).then(r=>setSvc(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[slug]);
if(loading)return<div className="flex justify-center items-center min-h-screen"><CircularProgress/></div>;
if(!svc)return<div className="text-center py-32"><h2 className="text-2xl text-gray-500">Service not found</h2><Link to="/services" className="text-primary-500 mt-4 inline-block">← Back</Link></div>;
return(<><Helmet><title>{svc.title} – V-Trinity Solutions</title><meta name="description" content={svc.short_desc}/></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}>
{svc.banner_url&&<div className="absolute inset-0 opacity-20"><img src={svc.banner_url} alt="" className="w-full h-full object-cover"/></div>}
<div className="container-xl py-16 relative z-10"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
<div className="text-secondary-500 text-sm font-semibold uppercase mb-2">{svc.category_name}</div>
<h1 className="text-5xl font-bold font-heading text-white mb-4">{svc.title}</h1>
<p className="text-gray-300 text-lg max-w-2xl">{svc.short_desc}</p>
<Link to="/request-solution" className="btn-primary mt-6 inline-flex">Request This Service →</Link>
</motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl">
<div className="grid lg:grid-cols-3 gap-10">
<div className="lg:col-span-2">
<div className="prose prose-lg max-w-none text-gray-700" dangerouslySetInnerHTML={{__html:svc.full_desc||'<p>'+svc.short_desc+'</p>'}}/>
{svc.gallery?.length>0&&<div className="mt-10"><h3 className="text-xl font-bold text-dark-800 mb-4">Gallery</h3><div className="grid grid-cols-2 md:grid-cols-3 gap-3">{svc.gallery.map(g=><img key={g.gallery_id||g.file_id} src={g.file_url} alt={g.caption||svc.title} className="rounded-xl w-full h-40 object-cover"/>)}</div></div>}
{svc.faqs?.length>0&&<div className="mt-10"><h3 className="text-xl font-bold text-dark-800 mb-4">Frequently Asked Questions</h3>{svc.faqs.map(f=><Accordion key={f.faq_id} elevation={0} sx={{border:'1px solid #e2e8f0',mb:1,borderRadius:'8px!important','&:before':{display:'none'}}}><AccordionSummary><Typography fontWeight={600}>{f.question}</Typography></AccordionSummary><AccordionDetails><Typography color="text.secondary">{f.answer}</Typography></AccordionDetails></Accordion>)}</div>}
</div>
<div><div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
<h3 className="font-bold text-dark-800 mb-4">Request This Service</h3>
<p className="text-gray-500 text-sm mb-5">Get a customized quote and consultation from our expert team.</p>
<Link to="/request-solution" className="btn-primary block text-center mb-3">Get a Free Quote</Link>
<Link to="/contact" className="block text-center text-primary-500 text-sm font-medium">Contact Us</Link>
{svc.documents?.length>0&&<div className="mt-6 border-t border-gray-200 pt-5"><div className="font-semibold text-dark-800 text-sm mb-3">Downloads</div>{svc.documents.map(d=><a key={d.doc_id||d.file_id} href={d.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-primary-500 mb-2 hover:underline">📄 {d.title}</a>)}</div>}
</div></div></div></div></div>
</>);}


