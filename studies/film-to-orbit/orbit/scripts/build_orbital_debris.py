"""Bake damaged wreckage into one mesh with one small shared material atlas.

Kenney source meshes are CC0; the wheel, railing and pavement are original.
Runs offline. No mesh processing, source OBJ parsing or physics ships at runtime.
"""
from pathlib import Path
import math, struct, json, random, zlib

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'asset-sources/kenney-city-kit-roads'
positions, normals, colours, texcoords = [], [], [], []
surface=0  # painted steel, asphalt, exposed concrete, rubber
class Palette:
    def __init__(self,path):
        data=path.read_bytes();self.width,self.height,depth,kind,_,_,interlace=struct.unpack('>IIBBBBB',data[16:29])
        assert (depth,kind,interlace)==(8,6,0)
        offset=8;compressed=b''
        while offset<len(data):
            size=struct.unpack('>I',data[offset:offset+4])[0]
            if data[offset+4:offset+8]==b'IDAT':compressed+=data[offset+8:offset+8+size]
            offset+=size+12
        raw=zlib.decompress(compressed);stride=self.width*4;self.rows=[];prev=bytearray(stride)
        for y in range(self.height):
            f=raw[y*(stride+1)];row=bytearray(raw[y*(stride+1)+1:(y+1)*(stride+1)])
            for x in range(stride):
                a=row[x-4] if x>=4 else 0;b=prev[x];c=prev[x-4] if x>=4 else 0
                if f==1:delta=a
                elif f==2:delta=b
                elif f==3:delta=(a+b)//2
                elif f==4:
                    p=a+b-c;dist=[abs(p-a),abs(p-b),abs(p-c)];delta=[a,b,c][dist.index(min(dist))]
                else:delta=0
                row[x]=(row[x]+delta)&255
            self.rows.append(row);prev=row
    def getpixel(self,p):
        x,y=p;return self.rows[y][x*4:x*4+3]
palette = Palette(SOURCE / 'colormap.png')
rng = random.Random(801)
counts = {}

def transform(p, at, angles, scale):
    x, y, z = [v * scale for v in p]
    for axis, a in enumerate(angles):
        c, s = math.cos(a), math.sin(a)
        if axis == 0: y, z = c*y-s*z, s*y+c*z
        elif axis == 1: x, z = c*x+s*z, -s*x+c*z
        else: x, y = c*x-s*y, s*x+c*y
    return (x+at[0], y+at[1], z+at[2])

def triangle(a, b, c, colour, at=(0,0,0), angles=(0,0,0), scale=1, smooth=None):
    local=(a,b,c)
    ab=[b[i]-a[i] for i in range(3)];ac=[c[i]-a[i] for i in range(3)]
    normal=(ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0])
    axes=[i for i in range(3) if i!=max(range(3),key=lambda i:abs(normal[i]))]
    a,b,c = [transform(p,at,angles,scale) for p in (a,b,c)]
    u=[b[i]-a[i] for i in range(3)]; v=[c[i]-a[i] for i in range(3)]
    n=(u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0])
    length=math.sqrt(sum(x*x for x in n))
    if length<1e-10:return
    for index,p in enumerate((a,b,c)):
        positions.extend(p)
        normals.extend(transform(smooth[index],(0,0,0),angles,1) if smooth else (x/length for x in n))
        u,v=[max(.025,min(.975,.5+local[index][axis]*.56)) for axis in axes]
        texcoords.extend(((surface%2+u)*.5,(surface//2+v)*.5))
        # glTF vertex colours are linear, unlike the source palette's sRGB bytes.
        colours.extend(round(255*(c/255/12.92 if c/255<=.04045 else ((c/255+.055)/1.055)**2.4)) for c in colour)

def source_mesh(name, at, angles, size, damage):
    verts=[];uvs=[];faces=[]
    for line in (SOURCE/(name+'.obj')).read_text().splitlines():
        bits=line.split()
        if not bits:continue
        if bits[0]=='v':verts.append(tuple(map(float,bits[1:4])))
        elif bits[0]=='vt':uvs.append(tuple(map(float,bits[1:3])))
        elif bits[0]=='f':faces.append([tuple(int(i) if i else 0 for i in f.split('/')) for f in bits[1:]])
    lo=[min(v[i] for v in verts) for i in range(3)];hi=[max(v[i] for v in verts) for i in range(3)]
    centre=[(lo[i]+hi[i])/2 for i in range(3)];extent=max(hi[i]-lo[i] for i in range(3))
    before=len(positions)//9
    for face in faces:
        if damage=='lamp' and all(verts[f[0]-1][1]<lo[1]+(hi[1]-lo[1])*.24 for f in face):continue
        pts=[]
        for f in face:
            p=[(verts[f[0]-1][i]-centre[i])/extent for i in range(3)]
            if damage=='lamp':p[0]=p[0]*1.6+.7*max(0,p[1]+.1)**2;p[2]*=1.6
            elif damage=='signal':
                p[1]+=.22*p[2]*abs(p[2]);p[0]+=.09*p[2]
                if p[2]>.23:p[0]-=(p[2]-.23)*.38;p[1]+=(p[2]-.23)*.25
            elif damage=='sign':p[1]+=.22*p[2];p[0]+=.25*max(0,p[2])**2
            pts.append(p)
        uv=uvs[face[0][1]-1] if len(face[0])>1 and face[0][1] else (0,0)
        col=palette.getpixel((min(palette.width-1,max(0,int(uv[0]*palette.width))),min(palette.height-1,max(0,int((1-uv[1])*palette.height)))))
        if damage=='sign' and col[1]>col[0]*1.12:col=(35,65,132)
        # Muted, scuffed street surfaces instead of the pack's clean toy palette.
        avg=sum(col)/3; wear=rng.uniform(.62,.84)
        col=tuple(int(max(12,min(220,(c*.72+avg*.28)*wear))) for c in col)
        if damage=='signal':
            # Roadside equipment with a crushed, soot-dark casing and dead lenses.
            if col[0]>col[2]*1.4 and col[1]>col[2]*1.3:col=(65,65,57)
            else:col=tuple(int(c*.65) for c in col)
        for i in range(1,len(pts)-1):triangle(pts[0],pts[i],pts[i+1],col,at,angles,size)
    counts[name]=len(positions)//9-before

def tube(a,b,r,colour,at=(0,0,0),angles=(0,0,0),sides=8):
    d=[b[i]-a[i] for i in range(3)];length=math.sqrt(sum(v*v for v in d));d=[v/length for v in d]
    ref=(0,1,0) if abs(d[1])<.9 else (1,0,0)
    u=[d[1]*ref[2]-d[2]*ref[1],d[2]*ref[0]-d[0]*ref[2],d[0]*ref[1]-d[1]*ref[0]]
    l=math.sqrt(sum(v*v for v in u));u=[v/l for v in u]
    v=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]
    def point(base,j):return [base[k]+r*(u[k]*math.cos(j*math.tau/sides)+v[k]*math.sin(j*math.tau/sides)) for k in range(3)]
    for j in range(sides):
        p,q,t,w=point(a,j),point(a,j+1),point(b,j+1),point(b,j)
        triangle(p,q,t,colour,at,angles);triangle(p,t,w,colour,at,angles)
        triangle(a,q,p,colour,at,angles);triangle(b,w,t,colour,at,angles)

def torus(major,minor,colour,at,angles,segments=32,sides=10,damaged=False):
    def point(i,j):
        a=i*math.tau/segments;b=j*math.tau/sides
        r=major+minor*math.cos(b)
        if damaged:r*=1-.2*max(0,math.cos(a-2.1))**8
        return (r*math.cos(a),r*math.sin(a),minor*math.sin(b)+(.025*math.sin(a*3) if damaged else 0))
    def normal(i,j):
        a=i*math.tau/segments;b=j*math.tau/sides
        return (math.cos(b)*math.cos(a),math.cos(b)*math.sin(a),math.sin(b))
    for i in range(segments):
        if damaged and i in (9,10):continue  # torn-out sidewall, not an intact tyre
        for j in range(sides):
            a,b,c,d=point(i,j),point(i+1,j),point(i+1,j+1),point(i,j+1)
            triangle(a,b,c,colour,at,angles,smooth=(normal(i,j),normal(i+1,j),normal(i+1,j+1)))
            triangle(a,c,d,colour,at,angles,smooth=(normal(i,j),normal(i+1,j+1),normal(i,j+1)))

def slab(at,angles,size,colour):
    global surface
    original_surface=surface
    outline=[(-.58,-.3),(-.3,-.32),(-.19,-.44),(.28,-.4),(.4,-.27),(.52,-.26),(.44,.04),(.25,.12),(.26,.32),(.08,.42),(-.3,.36),(-.46,.18),(-.44,.03),(-.58,-.05)]
    top=[(x,.09+rng.uniform(-.025,.025),z) for x,z in outline]
    bottom=[(x*rng.uniform(.78,1.03),-.1+rng.uniform(-.035,.025),z*rng.uniform(.8,1.04)) for x,z in outline]
    for i in range(len(top)):
        j=(i+1)%len(top)
        # Uneven fractured cap and exposed lighter aggregate along the broken edge.
        surface=original_surface
        triangle((-.06,.075,.035),top[j],top[i],colour,at,angles,size)
        triangle((0,-.1,0),bottom[i],bottom[j],tuple(int(c*.52) for c in colour),at,angles,size)
        surface=2;side=(132+rng.randrange(22),129+rng.randrange(15),114+rng.randrange(15))
        middle=tuple((top[i][k]+bottom[j][k])*.5 for k in range(3))
        middle=(middle[0]+rng.uniform(-.035,.035),middle[1],middle[2]+rng.uniform(-.035,.035))
        for a,b in [(top[i],top[j]),(top[j],bottom[j]),(bottom[j],bottom[i]),(bottom[i],top[i])]:triangle(a,b,middle,side,at,angles,size)
    surface=original_surface
    # Discontinuous worn road paint; short missing stretches expose the road.
    for k in range(11) if original_surface==1 else ():
        if k in (3,7,8):continue
        x=-.43+k*.071;y=.103
        strip=[(x,y,-.052),(x+.058,y,-.045),(x+.053,y,.042),(x-.009,y,.035)]
        triangle(strip[0],strip[2],strip[1],(173,169,150),at,angles,size)
        triangle(strip[0],strip[3],strip[2],(173,169,150),at,angles,size)
    # Two short exposed reinforcement ends, visibly bent at the fracture.
    surface=0
    for z in [-.14,.14]:
        tube((.32,-.01,z),(.62,-.04,z+.015),.014,(94,80,65),at,angles,6)
        tube((.62,-.04,z+.015),(.7,-.13,z+.04),.014,(104,91,74),at,angles,6)
    surface=original_surface

def torn_sign(at,angles,size):
    global surface
    surface=0
    outline=[(-.53,-.19),(.08,-.2),(.27,-.14),(.43,-.24),(.51,-.07),(.35,.02),(.49,.09),(.3,.23),(.02,.2),(-.4,.22),(-.55,.1)]
    centre=(0,0,.025)
    pts=[(x,y,.12*max(0,x)+(.055 if i in (3,4,6) else 0)) for i,(x,y) in enumerate(outline)]
    for i,p in enumerate(pts):
        q=pts[(i+1)%len(pts)]
        triangle(centre,p,q,(28,48,75),at,angles,size)
        triangle((0,0,.013),(q[0],q[1],q[2]-.012),(p[0],p[1],p[2]-.012),(98,102,98),at,angles,size)
        # Exposed metal around torn perimeter.
        tube(p,q,.007,(132,134,127),at,angles,5)
    # Fragment of a white direction arrow, cut by the folded edge.
    for a,b,c in [((-.32,-.028,.03),(.08,-.028,.04),(.08,.028,.04)),((-.32,-.028,.03),(.08,.028,.04),(-.32,.028,.03)),((.04,-.085,.042),(.21,0,.055),(.04,.085,.042))]:
        triangle(a,b,c,(159,158,145),at,angles,size)

source_mesh('light-curved',(-1.5,3.25,-.8),(.2,.6,-.9),1.8,'lamp')
source_mesh('traffic-light-object-horizontal',(2.75,1.65,-1.5),(.15,1.25,-.38),1.12,'signal')
torn_sign((-3.0,.1,-1.0),(.15,.3,.55),1.12)
for i in range(3):
    at=(2.75,1.65,-1.5);angles=(.15,1.25,-.38)
    a=(.015+i*.018,-.07,.34);b=(.04+i*.02,-.25,.46)
    tube(a,b,.007,(40,39,33),at,angles,5)
    tube(b,(.15+i*.02,-.31,.48),.006,(54,48,35),at,angles,5)

before=len(positions)//9
wheel_at=(.95,-2.85,1.9);wheel_angles=(.42,.6,-.35)
surface=3
torus(.32,.12,(47,46,41),wheel_at,wheel_angles,damaged=True)
# Worn diagonal tread cuts follow the deformed tyre, baked as fixed geometry.
for i in range(32):
    if i in (9,10):continue
    a=i*math.tau/32;r=.439*(1-.2*max(0,math.cos(a-2.1))**8)
    for side in [-1,1]:
        a1=a+.045*side;a2=a+.018
        p=(r*math.cos(a),r*math.sin(a),0)
        q=(r*.985*math.cos(a1),r*.985*math.sin(a1),side*.07)
        t=(r*.985*math.cos(a1+.018),r*.985*math.sin(a1+.018),side*.07)
        w=(r*math.cos(a2),r*math.sin(a2),0)
        triangle(p,q,t,(15,16,14),wheel_at,wheel_angles);triangle(p,t,w,(15,16,14),wheel_at,wheel_angles)
surface=0
torus(.215,.035,(119,117,104),wheel_at,wheel_angles,32,8,damaged=True)
tube((0,0,-.11),(0,0,.12),.075,(75,79,77),wheel_at,wheel_angles)
for i in range(5):
    if i==2:continue
    a=i*math.tau/5;middle=(.12*math.cos(a),.12*math.sin(a),.1 if i==1 else .06)
    tube((.06*math.cos(a),.06*math.sin(a),.08),middle,.024,(113,112,101),wheel_at,wheel_angles,6)
    tube(middle,(.205*math.cos(a),.205*math.sin(a),.02 if i==1 else .06),.024,(113,112,101),wheel_at,wheel_angles,6)
counts['original-wheel']=len(positions)//9-before

before=len(positions)//9
at=(-2.6,-1.9,-1.15);angles=(.25,.45,-.4)
tube((-.75,-.25,0),(.12,-.27,.04),.04,(72,75,70),at,angles)
tube((.12,-.27,.04),(.63,-.1,.32),.04,(84,82,72),at,angles)
tube((-.72,.3,0),(-.15,.23,.08),.04,(80,84,78),at,angles)
tube((.04,.17,.14),(.46,.42,.35),.04,(86,87,77),at,angles)
for i,x in enumerate([-.65,-.35,-.05,.25,.55]):
    a=(x,-.27,.04);b=(x+.08,.02,.05+.07*i);c=(x+.13,.25 if i!=2 else .08,.05+.09*i)
    tube(a,b,.025,(98,97,85),at,angles,8)
    if i!=2:tube(b,c,.025,(98,97,85),at,angles,8)
counts['original-bent-railing']=len(positions)//9-before
surface=2;slab((1.05,2.95,-.5),(.8,.4,.6),.9,(133,130,116))
surface=1;slab((-1.2,-2.65,1.0),(.6,-.3,-.25),1.0,(77,76,69))
surface=2;slab((3.1,-.35,-.8),(.9,.2,.65),.7,(132,128,114))

def png(width,height,data):
    def chunk(kind,content):return struct.pack('>I',len(content))+kind+content+struct.pack('>I',zlib.crc32(kind+content)&0xffffffff)
    rows=b''.join(b'\0'+bytes(data[y*width*3:(y+1)*width*3]) for y in range(height))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',width,height,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(rows,9))+chunk(b'IEND',b'')

def atlas():
    # Four 128px material patches, shared by all props. Detail is baked offline.
    size=256;tile=128;diffuse=bytearray();orm=bytearray();height=[]
    def noise(x,y):
        n=(int(x)*374761393+int(y)*668265263+1337)&0xffffffff;n=((n^(n>>13))*1274126177)&0xffffffff
        return ((n^(n>>16))&65535)/65535
    def broad(x,y,step):
        a=math.floor(x/step);b=math.floor(y/step);u=x/step-a;v=y/step-b
        u=u*u*(3-2*u);v=v*v*(3-2*v)
        return (noise(a,b)*(1-u)+noise(a+1,b)*u)*(1-v)+(noise(a,b+1)*(1-u)+noise(a+1,b+1)*u)*v
    for y in range(size):
        for x in range(size):
            kind=(x//tile)+(y//tile)*2;n=noise(x,y);m=broad(x,y,9);b=broad(x,y,31)
            light=.74+.2*b+.12*(n-.5);h=.1*n;rough=.86;metal=0
            if kind==0:
                scratch=abs(((x*.17+y*.032)%1)-.5)<.014 and m>.45
                light=.55+.4*b+.14*n;h=.045*n;rough=.67+.25*(1-b);metal=.18
                if scratch:light=.98;h=.01;rough=.45;metal=.65
                if n>.965 and m<.5:light*=.43;h=-.12
            elif kind==1:
                light=.45+.32*m+.22*n;h=.27*n+.12*m;rough=.96
                if n>.9:light=.92;h=.4
            elif kind==2:
                light=.67+.24*b+.18*(n-.5);h=.2*n+.08*m;rough=.94
                if n<.035 and m>.4:light=.32;h=-.25
            else:
                light=.55+.3*b+.13*n;h=.04*n;rough=.91
                if abs(math.sin(x*.35+y*.12))>.98:light*=.75;h-=.04
            v=max(0,min(255,int(light*255)));diffuse.extend((v,max(0,v-2),max(0,v-7)))
            orm.extend((255,int(rough*255),int(metal*255)));height.append(h)
    normal=bytearray()
    for y in range(size):
        for x in range(size):
            lx=x//tile*tile;ly=y//tile*tile
            dx=(height[y*size+min(lx+tile-1,x+1)]-height[y*size+max(lx,x-1)])*.75
            dy=(height[min(ly+tile-1,y+1)*size+x]-height[max(ly,y-1)*size+x])*.75
            length=math.sqrt(dx*dx+dy*dy+1)
            normal.extend((round(127.5*(1-dx/length)),round(127.5*(1-dy/length)),round(127.5*(1+1/length))))
    return [png(size,size,a) for a in (diffuse,orm,normal)]

# One material + one primitive means one additional draw call for all hero debris.
parts=[struct.pack('<%sf'%len(positions),*positions),struct.pack('<%sf'%len(normals),*normals),bytes(colours),struct.pack('<%sf'%len(texcoords),*texcoords)]
images=atlas();geometry_bytes=sum(len(p) for p in parts)
binary=bytearray();views=[]
for index,part in enumerate(parts+images):
    while len(binary)%4:binary.append(0)
    view={'buffer':0,'byteOffset':len(binary),'byteLength':len(part)}
    if index<4:view['target']=34962
    views.append(view);binary.extend(part)
count=len(positions)//3
doc={'asset':{'version':'2.0','generator':'Bouncing Concrete offline debris baker'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'Frozen street wreckage'}],
 'meshes':[{'primitives':[{'attributes':{'POSITION':0,'NORMAL':1,'COLOR_0':2,'TEXCOORD_0':3},'material':0}]}],
 'materials':[{'name':'Baked impact wear','pbrMetallicRoughness':{'baseColorFactor':[1,1,1,1],'baseColorTexture':{'index':0},'metallicFactor':1,'roughnessFactor':1,'metallicRoughnessTexture':{'index':1}},'normalTexture':{'index':2,'scale':.65}}],
 'images':[{'bufferView':i+4,'mimeType':'image/png'} for i in range(3)],
 'textures':[{'source':i,'sampler':0} for i in range(3)],'samplers':[{'magFilter':9729,'minFilter':9987,'wrapS':33071,'wrapT':33071}],
 'buffers':[{'byteLength':len(binary)}],'bufferViews':views,'accessors':[
 {'bufferView':0,'componentType':5126,'count':count,'type':'VEC3','min':[min(positions[i::3]) for i in range(3)],'max':[max(positions[i::3]) for i in range(3)]},
 {'bufferView':1,'componentType':5126,'count':count,'type':'VEC3'},
 {'bufferView':2,'componentType':5121,'normalized':True,'count':count,'type':'VEC3'},
 {'bufferView':3,'componentType':5126,'count':count,'type':'VEC2'}]}
encoded=json.dumps(doc,separators=(',',':')).encode();encoded+=b' '*((-len(encoded))%4);binary+=b'\0'*((-len(binary))%4)
glb=struct.pack('<III',0x46546c67,2,28+len(encoded)+len(binary))+struct.pack('<II',len(encoded),0x4e4f534a)+encoded+struct.pack('<II',len(binary),0x004e4942)+binary
(ROOT/'assets/orbital-wreckage.glb').write_bytes(glb)
report={'heroObjects':8,'triangles':count//3,'drawCalls':1,'geometryBufferBytes':geometry_bytes,'downloadBytes':len(glb),'textures':3,'atlasSize':256,'estimatedRGBA8TextureBytesWithMipmaps':1048572,'parts':counts}
(ROOT/'assets/orbital-wreckage-budget.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report))
