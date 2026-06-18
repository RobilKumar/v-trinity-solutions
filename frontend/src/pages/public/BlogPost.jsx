import React,{useEffect,useState}from'react';import{useParams,Link}from'react-router-dom';import{Helmet}from'react-helmet-async';import{CircularProgress,Chip}from'@mui/material';import{motion}from'framer-motion';import api from'../../services/api';
export default function BlogPost(){const{slug}=useParams();const[post,setPost]=useState(null);const[loading,setLoading]=useState(true);
useEffect(()=>{setLoading(true);api.get(`/blog/${slug}`).then(r=>setPost(r.data.data)).catch(()=>{}).finally(()=>setLoading(false));},[slug]);
if(loading)return<div className="flex justify-center items-center min-h-screen"><CircularProgress/></div>;
if(!post)return<div className="text-center py-32"><h2 className="text-2xl text-gray-500">Post not found</h2><Link to="/blog" className="text-primary-500 mt-4 inline-block">← Back to Blog</Link></div>;
return(<><Helmet><title>{post.title} – V-Trinity Solutions Blog</title><meta name="description" content={post.excerpt}/></Helmet>
<div style={{background:'linear-gradient(135deg,#0a0e1a,#0d1b3e)',paddingTop:80}}><div className="container-xl py-16 max-w-3xl"><motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}>
{post.category_name&&<Chip label={post.category_name} color="primary" size="small" sx={{mb:2}}/>}
<h1 className="text-4xl font-bold font-heading text-white mb-4">{post.title}</h1>
<div className="flex items-center gap-4 text-gray-400 text-sm"><span>By {post.author_name}</span><span>·</span><span>{new Date(post.publish_at||post.created_at).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})}</span><span>·</span><span>{post.view_count} views</span></div>
</motion.div></div></div>
<div className="section-padding bg-white"><div className="container-xl max-w-3xl">
{post.featured_image&&<img src={post.featured_image} alt={post.title} className="w-full rounded-2xl mb-8 shadow-lg"/>}
<div className="prose prose-lg max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{__html:post.content}}/>
{post.tags?.length>0&&<div className="mt-8 flex flex-wrap gap-2">{post.tags.map(t=><Chip key={t.slug} label={t.name} size="small" variant="outlined"/>)}</div>}
{post.related?.length>0&&<div className="mt-12"><h3 className="text-xl font-bold text-dark-800 mb-6">Related Articles</h3><div className="grid md:grid-cols-3 gap-4">{post.related.map(r=><Link key={r.post_id} to={`/blog/${r.slug}`} className="block rounded-xl border border-gray-100 p-4 hover:shadow-md transition-shadow"><div className="font-semibold text-dark-800 text-sm mb-1 line-clamp-2">{r.title}</div><p className="text-gray-500 text-xs line-clamp-2">{r.excerpt}</p></Link>)}</div></div>}
<div className="mt-8"><Link to="/blog" className="text-primary-500 font-medium">← Back to Blog</Link></div>
</div></div></>);}


