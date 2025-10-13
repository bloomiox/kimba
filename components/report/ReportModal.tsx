import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { CloseIcon, PrinterIcon } from '../common/Icons';
import SalesSummaryReport from './reports/SalesSummaryReport';
import ServicePerformanceReport from './reports/ServicePerformanceReport';
import DailyCloseoutReport from './reports/DailyCloseoutReport';
import ClientListReport from './reports/ClientListReport';
import type { Sale, Appointment, Client, Service } from '../../types';

type ReportType = 'salesSummary' | 'servicePerformance' | 'dailyCloseout' | 'clientList';

interface ReportModalProps {
  reportType: ReportType;
  data: {
    sales: Sale[];
    appointments: Appointment[];
    clients: Client[];
    services: Service[];
  };
  dateRange: { start: string; end: string };
  onClose: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ reportType, data, dateRange, onClose }) => {
  const { salonName, t } = useSettings();

  const handlePrint = () => {
    window.print();
  };

  const reportTitles: Record<ReportType, string> = {
    salesSummary: 'Sales Summary Report',
    servicePerformance: 'Service Performance Report',
    dailyCloseout: 'Daily Closeout Report',
    clientList: 'Client List',
  };

  const renderReport = () => {
    switch (reportType) {
      case 'salesSummary':
        return <SalesSummaryReport sales={data.sales} />;
      case 'servicePerformance':
        return (
          <ServicePerformanceReport appointments={data.appointments} services={data.services} />
        );
      case 'dailyCloseout':
        return <DailyCloseoutReport sales={data.sales} />;
      case 'clientList':
        return <ClientListReport clients={data.clients} />;
      default:
        return null;
    }
  };

  const formattedDateRange = () => {
    const start = new Date(`${dateRange.start}T00:00:00`);
    const end = new Date(`${dateRange.end}T00:00:00`);
    const lang = t('language.code');
    if (reportType === 'dailyCloseout') {
      return start.toLocaleDateString(lang, { dateStyle: 'full' });
    }
    if (dateRange.start === dateRange.end) {
      return start.toLocaleDateString(lang, { dateStyle: 'full' });
    }
    return `${start.toLocaleDateString(lang, { dateStyle: 'medium' })} - ${end.toLocaleDateString(lang, { dateStyle: 'medium' })}`;
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:hidden">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-4xl h-[90vh] p-6 relative flex flex-col animate-fade-in">
          <div className="flex-shrink-0 flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {reportTitles[reportType]}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-semibold"
              >
                <PrinterIcon className="w-5 h-5" /> Print / Save as PDF
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800 dark:hover:text-white"
              >
                <CloseIcon className="w-8 h-8" />
              </button>
            </div>
          </div>
          <div className="flex-grow overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg printable-area">
            {/* This div is what will be printed */}
            <div className="report-content">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">{salonName}</h1>
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">
                  {reportTitles[reportType]}
                </h2>
                <p className="text-sm text-gray-500">{formattedDateRange()}</p>
              </div>
              {renderReport()}
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            .printable-area, .printable-area * {
                visibility: visible;
            }
            .printable-area {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: auto;
                padding: 1rem;
            }
            .dark .printable-area {
                background-color: white !important;
                color: black !important;
            }
            .dark .printable-area h1, .dark .printable-area h2, .dark .printable-area p, .dark .printable-area div, .dark .printable-area span, .dark .printable-area th, .dark .printable-area td {
                 color: black !important;
            }
             .dark .printable-area tr:nth-child(even) {
                background-color: #f3f4f6 !important;
            }
        }
      `}</style>
    </>
  );
};

export default ReportModal;
