import React from 'react';
import { useI18n } from '../i18n';
import { relatedLinks } from '../config/links';

const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="section" id="footer">
      <div className="container card" style={{ display: 'grid', gap: '1rem' }}>
        <div>
          <h3 className="section-title">{t('related.title')}</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {relatedLinks.map((link) => (
              <a
                key={link.href}
                className="badge"
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', color: 'var(--muted)' }}>
          <div>
            <a href="#privacy">{t('footer.privacy')}</a> · <a href="#terms">{t('footer.terms')}</a> · <a href="/sitemap.xml">{t('footer.sitemap')}</a>
          </div>
          <div>
            © {new Date().getFullYear()} {t('brand.name')}. {t('footer.rights')}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
