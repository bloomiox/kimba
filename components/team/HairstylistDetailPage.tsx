import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  ChevronRightIcon, UserIcon, ClockIcon, ClipboardListIcon, EditIcon, TrashIcon, 
  StarIcon, DollarSignIcon, BarChartIcon, CheckIcon, PlusIcon, CloseIcon 
} from '../common/Icons';
import type { Hairstylist, Service, HairstylistSkill, HairstylistAvailability, HairstylistCommission } from '../../types';

interface HairstylistDetailPageProps {
  hairstylist: Hairstylist;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const HairstylistDetailPage: React.FC<HairstylistDetailPageProps> = ({ 
  hairstylist, 
  onBack, 
  onEdit, 
  onDelete 
}) => {
  const { 
    services, 
    updateHairstylistServices, 
    updateHairstylistAvailability, 
    updateHairstylistCommissions,
    addHairstylistSkill,
    updateHairstylistSkill,
    deleteHairstylistSkill,
    getHairstylistPerformance,
    t 
  } = useSettings();
  
  const [activeTab, setActiveTab] = useState<'services' | 'schedule' | 'skills' | 'commissions' | 'performance'>('services');
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<HairstylistSkill | null>(null);

  const assignedServices = services.filter(service => 
    hairstylist.serviceIds?.includes(service.id)
  );

  const availableServices = services.filter(service => 
    !hairstylist.serviceIds?.includes(service.id)
  );

  const performance = getHairstylistPerformance(hairstylist.id);

  const handleServiceToggle = (serviceId: string, isAssigned: boolean) => {
    const currentServices = hairstylist.serviceIds || [];
    const newServices = isAssigned 
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    updateHairstylistServices(hairstylist.id, newServices);
  };

  const handleAvailabilityChange = (dayIndex: number, field: keyof HairstylistAvailability, value: any) => {
    const newAvailability = [...(hairstylist.availability || [])];
    if (newAvailability[dayIndex]) {
      newAvailability[dayIndex] = { ...newAvailability[dayIndex], [field]: value };
      updateHairstylistAvailability(hairstylist.id, newAvailability);
    }
  };

  const handleCommissionChange = (serviceId: string, type: 'percentage' | 'fixed', value: number) => {
    const currentCommissions = hairstylist.commissions || [];
    const existingIndex = currentCommissions.findIndex(c => c.serviceId === serviceId);
    
    const newCommissions = [...currentCommissions];
    const commission = { serviceId, type, value };
    
    if (existingIndex >= 0) {
      newCommissions[existingIndex] = commission;
    } else {
      newCommissions.push(commission);
    }
    
    updateHairstylistCommissions(hairstylist.id, newCommissions);
  };

  const handleAddSkill = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const level = formData.get('level') as 'beginner' | 'intermediate' | 'advanced' | 'expert';
    const category = formData.get('category') as 'cutting' | 'coloring' | 'styling' | 'treatment' | 'other';

    if (name && level && category) {
      if (editingSkill) {
        updateHairstylistSkill(hairstylist.id, { ...editingSkill, name, level, category });
        setEditingSkill(null);
      } else {
        addHairstylistSkill(hairstylist.id, { name, level, category });
      }
      setIsSkillModalOpen(false);
    }
  };

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 rotate-180" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              {hairstylist.photoUrl ? (
                <img src={hairstylist.photoUrl} alt={hairstylist.name} className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{hairstylist.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 capitalize">
                {hairstylist.type === 'expert' ? t('team.expert') : t('team.station')}
              </p>
              {hairstylist.email && (
                <p className="text-sm text-gray-500 dark:text-gray-400">{hairstylist.email}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold"
          >
            <EditIcon className="w-4 h-4" />
            {t('common.edit')}
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-semibold text-white"
          >
            <TrashIcon className="w-4 h-4" />
            {t('common.delete')}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {[
          { id: 'services', label: t('team.tabs.services'), icon: ClipboardListIcon },
          { id: 'schedule', label: t('team.tabs.schedule'), icon: ClockIcon },
          { id: 'skills', label: t('team.tabs.skills'), icon: StarIcon },
          { id: 'commissions', label: t('team.tabs.commissions'), icon: DollarSignIcon },
          { id: 'performance', label: t('team.tabs.performance'), icon: BarChartIcon },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-accent shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="flex-grow overflow-y-auto">
        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4">{t('team.assignedServices')}</h3>
              {assignedServices.length > 0 ? (
                <div className="space-y-3">
                  {assignedServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span>${service.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleServiceToggle(service.id, true)}
                        className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-800 rounded-lg"
                      >
                        <CheckIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{t('team.noAssignedServices')}</p>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <h3 className="text-xl font-semibold mb-4">{t('team.availableServices')}</h3>
              {availableServices.length > 0 ? (
                <div className="space-y-3">
                  {availableServices.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-4 h-4" />
                            {service.duration} min
                          </span>
                          <span>${service.price}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleServiceToggle(service.id, false)}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <PlusIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400">{t('team.allServicesAssigned')}</p>
              )}
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">{t('team.weeklySchedule')}</h3>
            <div className="space-y-4">
              {dayNames.map((dayName, index) => {
                const availability = hairstylist.availability?.find(a => a.dayOfWeek === index);
                return (
                  <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <div className="w-24 font-medium">{t(`team.days.${dayName.toLowerCase()}`)}</div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={availability?.isAvailable || false}
                        onChange={(e) => handleAvailabilityChange(index, 'isAvailable', e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{t('team.available')}</span>
                    </label>
                    {availability?.isAvailable && (
                      <>
                        <input
                          type="time"
                          value={availability.startTime}
                          onChange={(e) => handleAvailabilityChange(index, 'startTime', e.target.value)}
                          className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                        />
                        <span className="text-gray-500">to</span>
                        <input
                          type="time"
                          value={availability.endTime}
                          onChange={(e) => handleAvailabilityChange(index, 'endTime', e.target.value)}
                          className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                        />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">{t('team.skillsSpecializations')}</h3>
              <button
                onClick={() => setIsSkillModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
              >
                <PlusIcon className="w-4 h-4" />
                {t('team.addSkill')}
              </button>
            </div>
            {hairstylist.skills && hairstylist.skills.length > 0 ? (
              <div className="grid gap-3">
                {hairstylist.skills.map(skill => (
                  <div key={skill.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{skill.name}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          skill.level === 'expert' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          skill.level === 'advanced' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          skill.level === 'intermediate' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                        }`}>
                          {t(`team.skillLevels.${skill.level}`)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {t(`team.skillCategories.${skill.category}`)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSkill(skill);
                          setIsSkillModalOpen(true);
                        }}
                        className="p-2 text-gray-400 hover:text-accent hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteHairstylistSkill(hairstylist.id, skill.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">{t('team.noSkills')}</p>
            )}
          </div>
        )}

        {/* Commissions Tab */}
        {activeTab === 'commissions' && (
          <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <h3 className="text-xl font-semibold mb-4">{t('team.commissionRates')}</h3>
            <div className="space-y-4">
              {assignedServices.map(service => {
                const commission = hairstylist.commissions?.find(c => c.serviceId === service.id);
                return (
                  <div key={service.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${service.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={commission?.type || 'percentage'}
                        onChange={(e) => handleCommissionChange(service.id, e.target.value as 'percentage' | 'fixed', commission?.value || 0)}
                        className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                      >
                        <option value="percentage">{t('team.percentage')}</option>
                        <option value="fixed">{t('team.fixed')}</option>
                      </select>
                      <input
                        type="number"
                        min="0"
                        max={commission?.type === 'percentage' ? 100 : undefined}
                        step={commission?.type === 'percentage' ? 1 : 0.01}
                        value={commission?.value || 0}
                        onChange={(e) => handleCommissionChange(service.id, commission?.type || 'percentage', parseFloat(e.target.value) || 0)}
                        className="w-20 px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
                      />
                      <span className="text-sm text-gray-500">
                        {commission?.type === 'percentage' ? '%' : '$'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            {performance ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <DollarSignIcon className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.totalRevenue')}</p>
                        <p className="text-xl font-bold">${performance.totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <ClipboardListIcon className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.totalAppointments')}</p>
                        <p className="text-xl font-bold">{performance.totalAppointments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <StarIcon className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.averageRating')}</p>
                        <p className="text-xl font-bold">{performance.averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <DollarSignIcon className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.totalCommission')}</p>
                        <p className="text-xl font-bold">${performance.totalCommission.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-4">{t('team.topServices')}</h3>
                  {performance.topServices.length > 0 ? (
                    <div className="space-y-3">
                      {performance.topServices.map((serviceData, index) => (
                        <div key={serviceData.serviceId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">{serviceData.serviceName}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {serviceData.count} {t('team.appointments')}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold">${serviceData.revenue.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">{t('team.noPerformanceData')}</p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 text-center">
                <BarChartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{t('team.noPerformanceData')}</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('team.performanceWillAppear')}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skill Modal */}
      {isSkillModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
            <button 
              onClick={() => {
                setIsSkillModalOpen(false);
                setEditingSkill(null);
              }} 
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingSkill ? t('team.editSkill') : t('team.addSkill')}
            </h2>
            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('team.skillName')}
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  defaultValue={editingSkill?.name || ''}
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('team.category')}
                </label>
                <select
                  name="category"
                  id="category"
                  required
                  defaultValue={editingSkill?.category || 'cutting'}
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="cutting">{t('team.skillCategories.cutting')}</option>
                  <option value="coloring">{t('team.skillCategories.coloring')}</option>
                  <option value="styling">{t('team.skillCategories.styling')}</option>
                  <option value="treatment">{t('team.skillCategories.treatment')}</option>
                  <option value="other">{t('team.skillCategories.other')}</option>
                </select>
              </div>
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('team.skillLevel')}
                </label>
                <select
                  name="level"
                  id="level"
                  required
                  defaultValue={editingSkill?.level || 'intermediate'}
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="beginner">{t('team.skillLevels.beginner')}</option>
                  <option value="intermediate">{t('team.skillLevels.intermediate')}</option>
                  <option value="advanced">{t('team.skillLevels.advanced')}</option>
                  <option value="expert">{t('team.skillLevels.expert')}</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSkillModalOpen(false);
                    setEditingSkill(null);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
                >
                  {editingSkill ? t('common.save') : t('team.addSkill')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HairstylistDetailPage;