import { writable } from 'svelte/store';

// Store oluşturuyoruz ve varsayılan olarak bugünün tarihini veriyoruz
export const initialDate = writable(new Date());