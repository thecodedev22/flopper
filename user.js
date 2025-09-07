import GUN from 'gun';
import 'gun/sea';
import 'gun/axe';

//Database 
export const db = GUN();

//The user
export const user = db.user().recall ({sessionStorage: true});
import {writable} from 'svelte/store';

//current users username
export const username = writable('');
user.get('alias').on(v => username.set(v));
