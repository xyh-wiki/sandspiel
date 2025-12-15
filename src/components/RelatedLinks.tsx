import React from 'react';
import { relatedLinks } from '../config/links';

const RelatedLinks: React.FC = () => {
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
      {relatedLinks.map((link) => (
        <a
          key={link.href}
          className="card"
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'grid', gap: '0.35rem' }}
        >
          <div style={{ fontWeight: 600 }}>{link.label}</div>
          {link.description && <div style={{ color: 'var(--muted)' }}>{link.description}</div>}
        </a>
      ))}
    </div>
  );
};

export default RelatedLinks;
