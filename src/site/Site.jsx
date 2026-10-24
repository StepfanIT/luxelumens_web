import { useEffect, useState } from 'react';
import { ContentProvider } from './content.jsx';
import { startMotion } from './motion.js';
import AppStory from './sections/AppStory.jsx';
import Compare from './sections/Compare.jsx';
import Consent from './sections/Consent.jsx';
import Craft from './sections/Craft.jsx';
import Faq from './sections/Faq.jsx';
import Footer from './sections/Footer.jsx';
import Gallery from './sections/Gallery.jsx';
import Hero from './sections/Hero.jsx';
import Highlights from './sections/Highlights.jsx';
import Manifesto from './sections/Manifesto.jsx';
import MobileBar from './sections/MobileBar.jsx';
import Nav from './sections/Nav.jsx';
import Privacy from './sections/Privacy.jsx';
import Process from './sections/Process.jsx';
import PromoBar from './sections/PromoBar.jsx';
import Quote from './sections/Quote.jsx';
import Reviews from './sections/Reviews.jsx';
import Seasons from './sections/Seasons.jsx';
import StructuredData from './StructuredData.jsx';

export default function Site({ lang }) {
  const [privacy, setPrivacy] = useState(false);
  useEffect(() => startMotion(), []);
  const showPrivacy = () => setPrivacy(true);
  return (
    <ContentProvider lang={lang}>
      <a href="#main" className="skip-link">
        {lang === 'pl' ? 'Przejdź do treści' : 'Skip to content'}
      </a>
      <PromoBar />
      <Nav />
      <main id="main">
        <Hero />
        <Highlights />
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
      <MobileBar />
      <Consent onPrivacy={showPrivacy} />
      <Privacy open={privacy} onClose={() => setPrivacy(false)} />
      <StructuredData />
    </ContentProvider>
  );
}
