// Development means "running on this machine". Production means everything else.
// Locally, add ?dev=0 to the address to preview the production view.
const params = new URLSearchParams(location.search);
const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) || location.hostname.endsWith('.local');

export const isDev = local && params.get('dev') !== '0';

// Speaker notes hold working notes (original wording, open questions and so on), so visitors
// do not get them. They are on in development, or in production with ?notes.
export const notesEnabled = isDev || params.has('notes');
