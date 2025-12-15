import React from 'react';

interface Props {
  id?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const SectionBlock: React.FC<Props> = ({ id, title, description, children }) => (
  <section id={id} className="section">
    <div className="container card" style={{ display: 'grid', gap: '0.75rem' }}>
      <h2 className="section-title">{title}</h2>
      {description && <p className="lead">{description}</p>}
      {children}
    </div>
  </section>
);

export default SectionBlock;
