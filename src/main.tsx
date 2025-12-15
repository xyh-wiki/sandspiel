import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider, bootstrapLanguage } from './i18n';
import { bootstrapTheme } from './state/theme';
import './styles/global.css';
import './styles/themes.css';
import './styles/typography.css';

const initialLanguage = bootstrapLanguage();
bootstrapTheme();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <I18nProvider initialLanguage={initialLanguage}>
      <App />
    </I18nProvider>
  </React.StrictMode>
);
