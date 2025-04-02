import { render } from 'preact';
import { html } from 'htm/preact';
import { Calendar } from './calendar.js';

export function App() {
  return html`<h1>Hello, World!</h1><${Calendar} />`;
}

render(html`<${App} />`, document.getElementById('app'));
