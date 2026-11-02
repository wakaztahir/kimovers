import http from 'node:http';
import { readFile, mkdir, appendFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.xml':'application/xml; charset=utf-8', '.txt':'text/plain; charset=utf-8', '.json':'application/json; charset=utf-8' };

async function collect(req) {
  let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 30000) throw new Error('Request is too large.'); }
  return JSON.parse(body || '{}');
}
function validate(data, kind) {
  const required = kind === 'quote' ? ['name','phone','email','service','from','to','date'] : ['name','phone','email','message'];
  return required.filter(key => !String(data[key] || '').trim());
}
async function saveRequest(req, res, kind) {
  try {
    const data = await collect(req), missing = validate(data, kind);
    if (missing.length) { res.writeHead(422, {'content-type':'application/json'}); return res.end(JSON.stringify({ error:'Please complete all required fields.', fields:missing })); }
    const record = { id: crypto.randomUUID(), kind, submittedAt: new Date().toISOString(), ...data };
    const dir = path.join(root,'data'); await mkdir(dir,{recursive:true});
    await appendFile(path.join(dir,'submissions.jsonl'), JSON.stringify(record)+'\n', {encoding:'utf8'});
    res.writeHead(201, {'content-type':'application/json'}); res.end(JSON.stringify({ ok:true, id:record.id }));
  } catch (error) { res.writeHead(400, {'content-type':'application/json'}); res.end(JSON.stringify({ error:error.message || 'Unable to save request.' })); }
}
const server = http.createServer(async (req,res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'POST' && url.pathname === '/api/quote') return saveRequest(req,res,'quote');
  if (req.method === 'POST' && url.pathname === '/api/contact') return saveRequest(req,res,'contact');
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); return res.end(); }
  let target = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  let file = path.resolve(root,'.'+target);
  if (!file.startsWith(root + path.sep) && file !== path.join(root,'index.html')) { res.writeHead(403); return res.end(); }
  try { if (!(await stat(file)).isFile()) throw new Error(); }
  catch { file = path.join(root,'index.html'); }
  try { const body = await readFile(file); res.writeHead(200, {'content-type':types[path.extname(file)] || 'application/octet-stream', 'cache-control':'no-cache'}); res.end(req.method === 'HEAD' ? undefined : body); }
  catch { res.writeHead(404); res.end('Not found'); }
});
server.listen(port, () => console.log(`Northline Relocation running at http://localhost:${port}`));
