import Link from 'next/link';
import ProductGrid from '@/components/ProductGrid';
import NewsletterForm from '@/components/NewsletterForm';
import { Icon, categoryIcons, valueIcons } from '@/components/icons';
import { categories, isCategory } from '@/lib/products';

const values = [
  { title: 'Pure sourcing', text: 'We partner with organic farms and ethical wildcrafters committed to chemical-free growing.' },
  { title: 'Sustainable practice', text: 'From seed to shelf: regenerative farming, minimal waste and carbon-neutral shipping where possible.' },
  { title: 'Transparent labels', text: 'Every ingredient is listed with its source. No synthetic fragrances or questionable additives.' },
  { title: 'Community focus', text: 'We reinvest 5% of profits into local organic farming and environmental education.' },
];

const testimonials = [
  { quote: 'The lavender serum is gentle enough for my sensitive skin. It’s the first one that didn’t irritate me.', name: 'Sarah K.', place: 'Portland, OR' },
  { quote: 'I have chronic allergies and trust TerraVerde’s herbs completely. You can feel the quality.', name: 'Michael T.', place: 'Asheville, NC' },
  { quote: 'The cork sandals are comfortable and have held up all season. Knowing they’re sustainable is a bonus.', name: 'Jessica L.', place: 'Boulder, CO' },
];

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const initial = isCategory(category) ? category : 'all';

  return (
    <>
      <section className="hero" id="hero">
        <div className="container hero-container">
          <div className="hero-content">
            <h1 className="hero-title">Rooted in nature, crafted with care.</h1>
            <p className="hero-subtitle">Natural cosmetics, edibles, herbal remedies, shoes, clothes and seeds, sourced from growers and makers we know by name.</p>
            <div className="hero-actions">
              <Link href="/#categories" className="cta-button primary">Explore categories</Link>
              <Link href="/#featured" className="cta-button secondary">View featured</Link>
            </div>
            <div className="trust-strip">
              <span>100% natural</span><span aria-hidden="true" />
              <span>Ethically sourced</span><span aria-hidden="true" />
              <span>Plastic-free packaging</span>
            </div>
          </div>
          <div className="hero-illustration" aria-hidden="true">
            <svg viewBox="0 0 320 360" xmlns="http://www.w3.org/2000/svg">
              <circle cx="220" cy="90" r="56" fill="#F0BE3C" />
              <g className="leaf"><path d="M160 340C40 320 20 190 70 120c70 10 110 90 90 220Z" fill="#2F6B3F" /><path d="M160 340C110 250 90 190 70 120" stroke="#17402A" strokeWidth="4" fill="none" /></g>
              <g className="leaf"><path d="M160 340c-10-130 30-210 110-230 40 90-10 200-110 230Z" fill="#4C8B5A" /><path d="M160 340C200 250 240 190 270 110" stroke="#17402A" strokeWidth="4" fill="none" /></g>
              <g className="leaf"><path d="M160 340c-40-60-30-120 0-170 40 50 40 110 0 170Z" fill="#A9CF8A" /></g>
            </svg>
          </div>
        </div>
      </section>

      <section className="category-showcase" id="categories">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Six ways to live more naturally</h2>
            <p className="section-subtitle">Browse our collection by category.</p>
          </header>
          <div className="category-grid">
            {categories.map((c) => (
              <div className="category-card" key={c.id}>
                <div className="category-icon"><Icon>{categoryIcons[c.id]}</Icon></div>
                <h3 className="category-name">{c.name}</h3>
                <p className="category-description">{c.description}</p>
                <Link href={`/?category=${c.id}#featured`} className="category-link" scroll>Shop {c.name.toLowerCase()}</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="featured-products" id="featured">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Customer favorites</h2>
            <p className="section-subtitle">Hand-selected for quality and purity.</p>
          </header>
          <ProductGrid key={initial} initialFilter={initial} />
        </div>
      </section>

      <section className="values-section" id="about">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Why choose natural?</h2>
            <p className="section-subtitle">Our commitment to purity, sustainability and care.</p>
          </header>
          <div className="values-grid">
            {values.map((v, i) => (
              <div className="value-card" key={v.title}>
                <div className="value-icon"><Icon>{valueIcons[i]}</Icon></div>
                <h3 className="value-title">{v.title}</h3>
                <p className="value-text">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="container">
          <header className="section-header"><h2 className="section-title">What customers say</h2></header>
          <div className="testimonials-slider">
            {testimonials.map((t) => (
              <div className="testimonial-slide" key={t.name}>
                <div className="stars" role="img" aria-label="5 out of 5 stars">★★★★★</div>
                <blockquote className="testimonial-text">“{t.quote}”</blockquote>
                <div className="testimonial-author">
                  <span className="author-avatar" aria-hidden="true">{t.name[0]}</span>
                  <div className="author-info"><h4 className="author-name">{t.name}</h4><p className="author-location">{t.place}</p></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="newsletter-section" id="contact">
        <div className="container">
          <header className="section-header">
            <h2 className="section-title">Get 10% off your first order</h2>
            <p className="section-subtitle">Join our list for natural living tips and new arrivals.</p>
          </header>
          <NewsletterForm />
        </div>
      </section>
    </>
  );
}
