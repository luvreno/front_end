import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { MotionProvider } from './lib/motion';
import { ConsentProvider } from './components/ConsentContext';
import { Nav, TopStrip } from './components/Nav';
import { Footer } from './components/Footer';
import { CookieConsent } from './components/CookieConsent';
import { ScrollManager } from './components/ScrollManager';
import { Intro } from './components/Intro';
import { PageLoader } from './components/PageLoader';
import Home from './pages/Home';

const Product = lazy(() => import('./pages/Product'));
const Blog = lazy(() => import('./pages/Blog'));
const Post = lazy(() => import('./pages/Post'));
const Legal = lazy(() => import('./pages/Legal'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <ConsentProvider>
      <MotionProvider>
        <a className="skip-link" href="#main">Skip to content</a>
        <ScrollManager />
        <Intro />
        <TopStrip />
        <Nav />
        <main id="main" tabIndex={-1}>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product" element={<Product />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<Post />} />
              <Route path="/privacy" element={<Legal kind="privacy" />} />
              <Route path="/terms" element={<Legal kind="terms" />} />
              <Route path="/cookies" element={<Legal kind="cookies" />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
        <CookieConsent />
      </MotionProvider>
    </ConsentProvider>
  );
}
