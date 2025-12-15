import React from 'react';
import { useI18n } from '../i18n';

const Hero: React.FC = () => {
  const { t } = useI18n();
  return (
    <section className="section" style={{ paddingTop: '1rem' }}>
      <div className="container card surface-tint" style={{ display: 'grid', gap: '1.2rem' }}>
        <div className="badge" style={{ width: 'fit-content' }}>{t('hero.performance')}</div>
        <h1 style={{ fontSize: '2.6rem' }}>{t('hero.title')}</h1>
        <p className="lead" style={{ maxWidth: 720 }}>{t('hero.subtitle')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
          <a className="btn btn-primary" href="#simulator" aria-label={t('hero.cta')}>
            {t('hero.cta')}
          </a>
          <a className="btn" href="#simulator">{t('cta.scroll')}</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
