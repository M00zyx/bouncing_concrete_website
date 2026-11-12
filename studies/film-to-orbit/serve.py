"""Local preview server with byte-range support for scroll-scrubbed video."""
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
from pathlib import Path
import re,os
class Handler(SimpleHTTPRequestHandler):
 def end_headers(self):
  self.send_header("Cache-Control","no-store")
  super().end_headers()
 def send_head(self):
  self.byte_range=None
  path=self.translate_path(self.path)
  if Path(path).suffix.lower() not in {'.mp4','.mp3','.m4a','.wav'} or not os.path.isfile(path):return super().send_head()
  f=open(path,'rb');size=os.fstat(f.fileno()).st_size;start,end=0,size-1
  raw=self.headers.get('Range');m=re.fullmatch(r'bytes=(\d*)-(\d*)',raw or '')
  if raw and not m:
   f.close();self.send_error(416);return None
  if m:
   a,b=m.groups()
   if a:start=int(a);end=min(int(b),size-1) if b else size-1
   elif b:start=max(0,size-int(b))
   if start> end or start>=size:
    f.close();self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return None
   self.byte_range=(start,end);self.send_response(206);self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
  else:self.send_response(200)
  self.send_header('Content-Type',self.guess_type(path));self.send_header('Accept-Ranges','bytes');self.send_header('Content-Length',str(end-start+1));self.end_headers();return f
 def copyfile(self,source,outputfile):
  if self.byte_range is None:return super().copyfile(source,outputfile)
  start,end=self.byte_range;source.seek(start);remaining=end-start+1
  while remaining:
   data=source.read(min(1024*1024,remaining))
   if not data:break
   outputfile.write(data);remaining-=len(data)
if __name__=='__main__':
 os.chdir(Path(__file__).resolve().parent)
 ThreadingHTTPServer(('127.0.0.1',4185),Handler).serve_forever()
