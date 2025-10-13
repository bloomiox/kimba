import React from 'react';
import { PlusIcon, CheckIcon, TrashIcon } from '../common/Icons';
import { mapToAccentColor } from '../../utils/colorUtils';
import type { ServicesStepProps } from './types';

const ServicesStep: React.FC<ServicesStepProps> = ({ data, updateData, commonServices }) => {
  const toggleService = (name: string) => {
    const isSelected = data.selectedServices.includes(name);
    updateData({
      selectedServices: isSelected
        ? data.selectedServices.filter(service => service !== name)
        : [...data.selectedServices, name],
    });
  };

  const addCustomService = () => {
    updateData({
      customServices: [...data.customServices, { name: '', duration: 30, price: 0 }],
    });
  };

  const updateCustomService = (
    index: number,
    field: 'name' | 'duration' | 'price',
    value: string
  ) => {
    const updated = [...data.customServices];
    if (field === 'duration') {
      updated[index].duration = parseInt(value, 10) || 0;
    } else if (field === 'price') {
      updated[index].price = parseFloat(value) || 0;
    } else {
      updated[index].name = value;
    }
    updateData({ customServices: updated });
  };

  const removeCustomService = (index: number) => {
    updateData({
      customServices: data.customServices.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          What services do you offer?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Select from common services or add your own
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Common Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonServices.map(service => (
              <button
                key={service.name}
                type="button"
                onClick={() => toggleService(service.name)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  data.selectedServices.includes(service.name)
                    ? mapToAccentColor('border-accent-500 bg-accent-50 dark:bg-accent-900/20')
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{service.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {service.duration} min •{' '}
                      {service.price.toLocaleString('en-US', {
                        style: 'currency',
                        currency: data.currency,
                      })}
                    </p>
                  </div>
                  {data.selectedServices.includes(service.name) && (
                    <CheckIcon className={`w-5 h-5 ${mapToAccentColor('text-accent-500')}`} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">Custom Services</h3>
            <button
              type="button"
              onClick={addCustomService}
              className={`flex items-center gap-2 px-3 py-1 ${mapToAccentColor('bg-accent-500')} text-white rounded-lg text-sm hover:opacity-90`}
            >
              <PlusIcon className="w-4 h-4" />
              Add Service
            </button>
          </div>

          {data.customServices.map((service, index) => (
            <div
              key={`${service.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-2"
            >
              <input
                type="text"
                value={service.name}
                onChange={event => updateCustomService(index, 'name', event.target.value)}
                placeholder="Service name"
                className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <input
                type="number"
                value={service.duration}
                onChange={event => updateCustomService(index, 'duration', event.target.value)}
                placeholder="Duration"
                className="w-20 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-sm text-gray-500">min</span>
              <input
                type="number"
                value={service.price}
                onChange={event => updateCustomService(index, 'price', event.target.value)}
                placeholder="Price"
                className="w-20 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
              />
              <span className="text-sm text-gray-500">{data.currency}</span>
              <button
                type="button"
                onClick={() => removeCustomService(index)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesStep;
