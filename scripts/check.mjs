import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
for(const mode of ['smooth','ascii'])for(const name of fs.readdirSync(new URL('../'+mode+'/dist/',import.meta.url)))if(name.endsWith('.js'))execFileSync(process.execPath,['--check',fileURLToPath(new URL('../'+mode+'/dist/'+name,import.meta.url))],{stdio:'inherit'});
console.log('Both variants passed JavaScript syntax checks.');
