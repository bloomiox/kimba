import React from 'react';
import type { Client } from '../../../types';
import { useSettings } from '../../../contexts/SettingsContext';

interface ClientListReportProps {
  clients: Client[];
}

const ClientListReport: React.FC<ClientListReportProps> = ({ clients }) => {
  const { t } = useSettings();
  return (
    <div>
      <table className="w-full text-left text-sm">
        <thead className="border-b dark:border-gray-600">
          <tr>
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {clients
            .sort((a, b) => a.name.localeCompare(b.name))
            .map(client => (
              <tr key={client.id} className="border-b dark:border-gray-700/50">
                <td className="p-2 font-medium">{client.name}</td>
                <td className="p-2">{client.email}</td>
                <td className="p-2">{client.phone || 'N/A'}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientListReport;
