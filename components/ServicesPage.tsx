import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { ClipboardListIcon, PlusIcon, CloseIcon, EditIcon, TrashIcon, ChevronRightIcon, FilterIcon } from './common/Icons';
import type { Service, ServiceGroup } from '../types';

interface ServiceModalProps {
  service?: Service;
  parentId: string | null;
  onClose: () => void;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, parentId, onClose }) => {
  const { addService, updateService, serviceGroups, currency, t } = useSettings();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const duration = parseInt(formData.get('duration') as string);
    const price = parseFloat(formData.get('price') as string);
    const serviceGroupId = formData.get('serviceGroupId') as string;

    if (name && duration && price) {
      if (service) {
        updateService({
          ...service,
          name,
          description: description || undefined,
          duration,
          price,
          serviceGroupId: serviceGroupId || undefined
        });
      } else {
        addService({
          name,
          description: description || undefined,
          duration,
          price,
          parentId,
          serviceGroupId: serviceGroupId || undefined
        });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {service ? t('services.modal.editService') : t('services.modal.addService')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('services.modal.name')}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={service?.name || ''}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('services.modal.description')}
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              defaultValue={service?.description || ''}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
              placeholder={t('services.modal.descriptionPlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="serviceGroupId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Service Group (Optional)
            </label>
            <select
              name="serviceGroupId"
              id="serviceGroupId"
              defaultValue={service?.serviceGroupId || ''}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="">No Group</option>
              {serviceGroups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('services.modal.duration')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  required
                  min="1"
                  defaultValue={service?.duration || 30}
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
                <span className="text-sm text-gray-500">{t('services.modal.minutes')}</span>
              </div>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('services.modal.price')} ({currency})
              </label>
              <input
                type="number"
                name="price"
                id="price"
                required
                min="0"
                step="0.01"
                defaultValue={service?.price || ''}
                className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
            >
              {service ? t('common.save') : t('services.modal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ServiceGroupModalProps {
  group?: ServiceGroup;
  parentId: string | null;
  onClose: () => void;
}

const ServiceGroupModal: React.FC<ServiceGroupModalProps> = ({ group, parentId, onClose }) => {
  const { addServiceGroup, updateServiceGroup, t } = useSettings();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    if (name) {
      if (group) {
        updateServiceGroup({
          ...group,
          name
        });
      } else {
        addServiceGroup({
          name,
          parentId
        });
      }
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fade-in">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white">
          <CloseIcon className="w-6 h-6" />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {group ? t('services.modal.editGroup') : t('services.modal.addGroup')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('services.modal.groupName')}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              defaultValue={group?.name || ''}
              className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
            >
              {group ? t('common.save') : t('services.modal.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ServiceTreeProps {
  parentId: string | null;
  level: number;
  searchTerm: string;
  onEditService: (service: Service) => void;
  onEditGroup: (group: ServiceGroup) => void;
  onAddService: (parentId: string | null) => void;
  onAddGroup: (parentId: string | null) => void;
}

const ServiceTree: React.FC<ServiceTreeProps> = ({ 
  parentId, 
  level, 
  searchTerm, 
  onEditService, 
  onEditGroup, 
  onAddService, 
  onAddGroup 
}) => {
  const { services, serviceGroups, deleteService, deleteServiceGroup, currency, t } = useSettings();

  const filteredGroups = useMemo(() => {
    return serviceGroups
      .filter(g => g.parentId === parentId)
      .filter(g => searchTerm === '' || g.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [serviceGroups, parentId, searchTerm]);

  const filteredServices = useMemo(() => {
    return services
      .filter(s => s.parentId === parentId)
      .filter(s => searchTerm === '' || 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services, parentId, searchTerm]);

  const handleDeleteService = (serviceId: string) => {
    if (window.confirm(t('services.confirmDeleteService'))) {
      deleteService(serviceId);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm(t('services.confirmDeleteGroup'))) {
      deleteServiceGroup(groupId);
    }
  };

  return (
    <div className={level > 0 ? 'ml-6' : ''}>
      {filteredGroups.map(group => (
        <div key={group.id} className="my-3">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-lg">
            <div className="flex items-center gap-3">
              <ClipboardListIcon className="w-5 h-5 text-accent" />
              <div>
                <h3 className="font-bold text-lg">{group.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('services.groupLevel')} {level + 1}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onAddService(group.id)} 
                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                title={t('services.addService')}
              >
                <PlusIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onAddGroup(group.id)} 
                className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors"
                title={t('services.addSubgroup')}
              >
                <ClipboardListIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => onEditGroup(group)} 
                className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteGroup(group.id)} 
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ServiceTree 
            parentId={group.id} 
            level={level + 1} 
            searchTerm={searchTerm}
            onEditService={onEditService}
            onEditGroup={onEditGroup}
            onAddService={onAddService}
            onAddGroup={onAddGroup}
          />
        </div>
      ))}
      
      {filteredServices.map(service => (
        <div key={service.id} className="my-2 p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h4 className="font-semibold text-lg">{service.name}</h4>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    ⏱️ {service.duration} {t('services.minutes')}
                  </span>
                  <span className="font-medium text-accent">
                    {service.price.toLocaleString(t('language.code'), { 
                      style: 'currency', 
                      currency: currency 
                    })}
                  </span>
                </div>
              </div>
              {service.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {service.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button 
                onClick={() => onEditService(service)} 
                className="p-2 text-gray-500 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <EditIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDeleteService(service.id)} 
                className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ServicesPage: React.FC = () => {
  const { services, serviceGroups, addServiceGroup, t } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [modalState, setModalState] = useState<{
    type: 'service' | 'group' | null;
    data?: Service | ServiceGroup;
    parentId?: string | null;
  }>({ type: null });

  const totalServices = services.length;
  const totalGroups = serviceGroups.length;

  const handleEditService = (service: Service) => {
    setModalState({ type: 'service', data: service, parentId: service.parentId });
  };

  const handleEditGroup = (group: ServiceGroup) => {
    setModalState({ type: 'group', data: group, parentId: group.parentId });
  };

  const handleAddService = (parentId: string | null) => {
    setModalState({ type: 'service', parentId });
  };

  const handleAddGroup = (parentId: string | null) => {
    setModalState({ type: 'group', parentId });
  };

  const closeModal = () => {
    setModalState({ type: null });
  };

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 space-y-4 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold">{t('services.title')}</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {totalServices} {t('services.servicesCount')} • {totalGroups} {t('services.groupsCount')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAddService(null)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('services.addService')}</span>
            </button>
            <button
              onClick={() => handleAddGroup(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold"
            >
              <ClipboardListIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('services.addGroup')}</span>
            </button>
            <button
              onClick={async () => {
                const name = prompt('Enter service group name:');
                if (name) {
                  await addServiceGroup({ name, parentId: null });
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-white"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Quick Add Group</span>
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={t('services.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
            <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
        {totalServices === 0 && totalGroups === 0 ? (
          <div className="text-center py-16">
            <ClipboardListIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('services.empty.title')}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">{t('services.empty.subtitle')}</p>
            <div className="flex justify-center gap-3 mt-6">
              <button
                onClick={() => handleAddService(null)}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
              >
                <PlusIcon className="w-5 h-5" />
                {t('services.addFirstService')}
              </button>
              <button
                onClick={() => handleAddGroup(null)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold"
              >
                <ClipboardListIcon className="w-5 h-5" />
                {t('services.addFirstGroup')}
              </button>
            </div>
          </div>
        ) : (
          <ServiceTree 
            parentId={null} 
            level={0} 
            searchTerm={searchTerm}
            onEditService={handleEditService}
            onEditGroup={handleEditGroup}
            onAddService={handleAddService}
            onAddGroup={handleAddGroup}
          />
        )}
      </div>

      {modalState.type === 'service' && (
        <ServiceModal 
          service={modalState.data as Service | undefined} 
          parentId={modalState.parentId ?? null} 
          onClose={closeModal} 
        />
      )}
      {modalState.type === 'group' && (
        <ServiceGroupModal 
          group={modalState.data as ServiceGroup | undefined} 
          parentId={modalState.parentId ?? null} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

export default ServicesPage;