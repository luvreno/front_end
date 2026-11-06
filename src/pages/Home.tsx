import { Seo } from '../components/Seo';
import { staticRoutes } from '../lib/seoData.ts';
import { Hero } from '../sections/Hero';
import { ProblemSection, HowItWorks } from '../sections/Problem';
import { FeaturesSection, RuleShelf, BuiltFor } from '../sections/Features';
import { JournalTeaser, About, FaqSection, ClosingBanner } from '../sections/Closing';
import { ContactSection } from '../sections/ContactForm';
import { PricingSection } from '../sections/Pricing';

const Divider = () => <hr className="stitch-divider thread-mobile" aria-hidden="true" />;

export default function Home() {
  return (
    <>
      <Seo {...staticRoutes['/']} />
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <FeaturesSection />
      <RuleShelf />
      <BuiltFor />
      <Divider />
      <PricingSection />
      <JournalTeaser />
      <About />
      <FaqSection />
      <Divider />
      <ContactSection />
      <ClosingBanner />
    </>
  );
}
