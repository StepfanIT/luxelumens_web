import '@fontsource-variable/geist';
import '@fontsource/instrument-serif/400-italic.css';
import 'lenis/dist/lenis.css';
import '../styles/site.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Site from './Site.jsx';
import { rememberSource } from './tracking.js';

const lang = document.documentElement.lang === 'en' ? 'en' : 'pl';
rememberSource();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Site lang={lang} />
  </StrictMode>,
);
