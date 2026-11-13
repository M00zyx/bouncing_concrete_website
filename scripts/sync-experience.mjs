import {cpSync, mkdirSync, readdirSync, rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
const source=path.join(root,'src/experience'),target=path.join(root,'public/experience');
// Generated output only; all editable files live under src/experience.
rmSync(target,{recursive:true,force:true});mkdirSync(target,{recursive:true});
for(const item of readdirSync(source,{withFileTypes:true})){
 if(item.isDirectory()||/\.(js|css)$/.test(item.name))cpSync(path.join(source,item.name),path.join(target,item.name),{recursive:true});
}
console.log('Synced approved experience runtime and media.');
