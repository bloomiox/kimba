import React, { useEffect, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

const TranslationDebug: React.FC = () => {
  const { t, language, loading } = useSettings();
  const [testTranslations, setTestTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    // Test some common translation keys
    const testKeys = [
      'common.save',
      'common.cancel', 
      'sidebar.dashboard',
      'sidebar.clients',
      'dashboard.welcome'
    ];

    const results: Record<string, string> = {};
    testKeys.forEach(key => {
      results[key] = t(key);
    });
    setTestTranslations(results);
  }, [t, language]);

  // Test direct fetch
  const [fetchTest, setFetchTest] = useState<string>('');
  useEffect(() => {
    fetch('/i18n/locales/de.json')
      .then(res => res.json())
      .then(data => {
        setFetchTest(`Fetch test: ${data['common.save'] || 'Not found'}`);
      })
      .catch(err => {
        setFetchTest(`Fetch error: ${err.message}`);
      });
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>🔍 Translation Debug</h4>
      <p><strong>Language:</strong> {language}</p>
      <p><strong>Loading:</strong> {loading ? 'Yes' : 'No'}</p>
      <p><strong>Direct fetch:</strong> {fetchTest}</p>
      
      <h5>Translation Tests:</h5>
      {Object.entries(testTranslations).map(([key, value]) => (
        <div key={key}>
          <strong>{key}:</strong> {value}
        </div>
      ))}
    </div>
  );
};

export default TranslationDebug;