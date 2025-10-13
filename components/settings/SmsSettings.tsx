import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import Input from '../common/Input';
import Button from '../common/Button';
import { PhoneIcon } from '../common/Icons';

const SmsSettings: React.FC = () => {
  const { sms, setSmsSettings } = useSettings();
  const [formState, setFormState] = useState(sms);

  useEffect(() => {
    setFormState(sms);
  }, [sms]);

  const handleSave = () => {
    setSmsSettings(formState);
    alert('SMS settings saved!');
  };

  return (
    <Card title="SMS Integration" titleIcon={PhoneIcon}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="smsEnabled" className="font-medium">
            Enable SMS Reminders
          </label>
          <button
            type="button"
            onClick={() => setFormState(s => ({ ...s, enabled: !s.enabled }))}
            className={`${formState.enabled ? 'bg-accent' : 'bg-gray-200 dark:bg-gray-600'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
            role="switch"
            aria-checked={formState.enabled}
          >
            <span
              className={`${formState.enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </button>
        </div>

        {formState.enabled && (
          <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label htmlFor="smsProvider" className="block text-sm font-medium mb-1">
                Provider
              </label>
              <select
                id="smsProvider"
                value={formState.provider}
                onChange={e => setFormState(s => ({ ...s, provider: e.target.value as any }))}
                className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="none">None</option>
                <option value="twilio">Twilio</option>
                <option value="plivo" disabled>
                  Plivo (coming soon)
                </option>
              </select>
            </div>
            {formState.provider === 'twilio' && (
              <div className="space-y-2">
                <div>
                  <label htmlFor="twilioSid" className="block text-sm font-medium mb-1">
                    Twilio Account SID
                  </label>
                  <Input
                    id="twilioSid"
                    type="text"
                    value={formState.twilioSid}
                    onChange={e => setFormState(s => ({ ...s, twilioSid: e.target.value }))}
                    placeholder="ACxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label htmlFor="twilioAuthToken" className="block text-sm font-medium mb-1">
                    Twilio Auth Token
                  </label>
                  <Input
                    id="twilioAuthToken"
                    type="password"
                    value={formState.twilioAuthToken}
                    onChange={e => setFormState(s => ({ ...s, twilioAuthToken: e.target.value }))}
                    placeholder="••••••••••••••••"
                  />
                </div>
                <div>
                  <label htmlFor="twilioFromNumber" className="block text-sm font-medium mb-1">
                    Twilio Phone Number
                  </label>
                  <Input
                    id="twilioFromNumber"
                    type="tel"
                    value={formState.twilioFromNumber}
                    onChange={e => setFormState(s => ({ ...s, twilioFromNumber: e.target.value }))}
                    placeholder="+15017122661"
                  />
                </div>
              </div>
            )}
            <div className="pt-2">
              <Button onClick={handleSave} className="w-full">
                Save SMS Settings
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default SmsSettings;
