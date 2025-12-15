import React from 'react';
import { useI18n } from '../i18n';
import { useThemeStore } from '../state/theme';

const Header: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useThemeStore();

  return (
    <header className="section" style={{ position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(10px)' }}>
      <div className="container card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'linear-gradient(140deg, #22c55e, #0ea5e9)', display: 'grid', placeItems: 'center', color: '#0b1220', fontWeight: 700 }}>
            {t('brand.name').charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{t('brand.name')}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>{t('brand.domain')}</div>
          </div>
        </div>
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <a href="#simulator" aria-label={t('nav.simulator')} className="badge">
            {t('nav.simulator')}
          </a>
          <a href="#how" aria-label={t('nav.how')} className="badge">
            {t('nav.how')}
          </a>
          <a href="#use" aria-label={t('nav.useCases')} className="badge">
            {t('nav.useCases')}
          </a>
          <a href="#faq" aria-label={t('nav.faq')} className="badge">
            {t('nav.faq')}
          </a>
          <a href="#contact" aria-label={t('nav.contact')} className="badge">
            {t('nav.contact')}
          </a>
          <label className="badge" style={{ gap: '0.35rem' }}>
            {t('labels.language')}
            <select
              aria-label={t('labels.language')}
              value={language}
              onChange={(e) => setLanguage(e.target.value as 'en' | 'zh')}
              style={{ background: 'transparent', color: 'inherit', border: 'none', outline: 'none' }}
            >
              <option value="en">EN</option>
              <option value="zh">中文</option>
            </select>
          </label>
          <button
            className="badge"
            aria-label={t('labels.theme')}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {t('labels.theme')}: {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
