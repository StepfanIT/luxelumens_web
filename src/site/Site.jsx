import { useEffect, useState } from 'react';
import { ContentProvider } from './content.jsx';
import { startMotion } from './motion.js';
import AppStory from './sections/AppStory.jsx';
import Compare from './sections/Compare.jsx';
import Craft from './sections/Craft.jsx';
import Faq from './sections/Faq.jsx';
import Footer from './sections/Footer.jsx';
import Gallery from './sections/Gallery.jsx';
import Hero from './sections/Hero.jsx';
import Manifesto from './sections/Manifesto.jsx';
import Nav from './sections/Nav.jsx';
import Privacy from './sections/Privacy.jsx';
import Process from './sections/Process.jsx';
import Quote from './sections/Quote.jsx';
import Reviews from './sections/Reviews.jsx';
import Seasons from './sections/Seasons.jsx';

export default function Site({ lang }) {
  const [privacy, setPrivacy] = useState(false);
  useEffect(() => startMotion(), []);
  const showPrivacy = () => setPrivacy(true);
  return (
    <ContentProvider lang={lang}>
      <a href="#main" className="skip-link">
        {lang === 'pl' ? 'Przejdź do treści' : 'Skip to content'}
      </a>
      <Nav />
      <main id="main">
        <Hero />
        <Manifesto />
        <Seasons />
        <AppStory />
        <Craft />
        <Gallery />
        <Compare />
        <Process />
        <Reviews />
        <Faq />
        <Quote onPrivacy={showPrivacy} />
      </main>
      <Footer onPrivacy={showPrivacy} />
      <Privacy open={privacy} onClose={() => setPrivacy(false)} />
    </ContentProvider>
  );
}
