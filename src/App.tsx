import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import CanvasBoard from './components/CanvasBoard';
import SectionBlock from './components/SectionBlock';
import RelatedLinks from './components/RelatedLinks';
import Footer from './components/Footer';
import { useI18n } from './i18n';

const App: React.FC = () => {
  const { t } = useI18n();
  const faqItems = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
    { q: t('faq.q5'), a: t('faq.a5') }
  ];

  return (
    <div>
      <Header />
      <main>
        <Hero />
        <CanvasBoard />
        <SectionBlock id="how" title={t('how.title')}>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: 'var(--text-secondary)', display: 'grid', gap: '0.3rem' }}>
            <li>{t('how.rule1')}</li>
            <li>{t('how.rule2')}</li>
            <li>{t('how.rule3')}</li>
            <li>{t('how.rule4')}</li>
            <li>{t('how.rule5')}</li>
          </ul>
        </SectionBlock>
        <SectionBlock id="use" title={t('use.title')}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div className="card">
              <h3>{t('use.education')}</h3>
            </div>
            <div className="card">
              <h3>{t('use.prototype')}</h3>
            </div>
            <div className="card">
              <h3>{t('use.relax')}</h3>
            </div>
          </div>
        </SectionBlock>
        <SectionBlock id="related" title={t('related.title')}>
          <RelatedLinks />
        </SectionBlock>
        <SectionBlock id="faq" title={t('faq.title')}>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {faqItems.map((item) => (
              <div key={item.q} className="card" style={{ display: 'grid', gap: '0.35rem' }}>
                <strong>{item.q}</strong>
                <span style={{ color: 'var(--muted)' }}>{item.a}</span>
              </div>
            ))}
          </div>
        </SectionBlock>
        <SectionBlock id="contact" title={t('contact.title')} description={t('contact.body')}>
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <strong>{t('about.title')}</strong>
            <span style={{ color: 'var(--muted)' }}>{t('about.body')}</span>
            <div>
              <div>{t('contact.email')}</div>
              <a href="mailto:xyh.wiki@gmail.com">{t('contact.email')}</a>
            </div>
          </div>
        </SectionBlock>
        <SectionBlock id="privacy" title={t('footer.privacy')} description={t('controls.saveNotice')}>
          <div className="card" style={{ color: 'var(--muted)' }}>
            {t('faq.a1')} {t('faq.a5')}
          </div>
        </SectionBlock>
        <SectionBlock id="terms" title={t('footer.terms')} description={t('hero.performance')}>
          <div className="card" style={{ color: 'var(--muted)' }}>
            {t('status.lowPowerHint')}
          </div>
        </SectionBlock>
      </main>
      <Footer />
    </div>
  );
};

export default App;
