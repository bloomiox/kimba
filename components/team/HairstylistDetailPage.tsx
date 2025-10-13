import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { supabase } from '../../services/supabaseClient';
import {
  ChevronRightIcon,
  UserIcon,
  ClockIcon,
  ClipboardListIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  DollarSignIcon,
  BarChartIcon,
  CheckIcon,
  PlusIcon,
  CloseIcon,
} from '../common/Icons';
import type {
  Hairstylist,
  Service,
  HairstylistSkill,
  HairstylistAvailability,
  HairstylistCommission,
  HairstylistBreak,
  HairstylistTimeOff,
} from '../../types';

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
  onDelete,
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
    t,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<
    'services' | 'schedule' | 'skills' | 'commissions' | 'performance'
  >('services');
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<HairstylistSkill | null>(null);
  const [isBreakModalOpen, setIsBreakModalOpen] = useState(false);
  const [editingBreak, setEditingBreak] = useState<{
    dayIndex: number;
    break: HairstylistBreak;
  } | null>(null);
  const [isTimeOffModalOpen, setIsTimeOffModalOpen] = useState(false);
  const [editingTimeOff, setEditingTimeOff] = useState<HairstylistTimeOff | null>(null);
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [localAvailability, setLocalAvailability] = useState<HairstylistAvailability[]>(
    hairstylist.availability || []
  );

  // Sync local availability when hairstylist prop changes
  useEffect(() => {
    setLocalAvailability(hairstylist.availability || []);
  }, [hairstylist.availability]);

  const assignedServices = services.filter(service => hairstylist.serviceIds?.includes(service.id));

  const availableServices = services.filter(
    service => !hairstylist.serviceIds?.includes(service.id)
  );

  const performance = getHairstylistPerformance(hairstylist.id);

  const handleServiceToggle = (serviceId: string, isAssigned: boolean) => {
    const currentServices = hairstylist.serviceIds || [];
    const newServices = isAssigned
      ? currentServices.filter(id => id !== serviceId)
      : [...currentServices, serviceId];
    updateHairstylistServices(hairstylist.id, newServices);
  };

  const handleAvailabilityChange = (
    dayIndex: number,
    field: keyof HairstylistAvailability,
    value: any
  ) => {
    const newAvailability = [...localAvailability];

    // Initialize availability for this day if it doesn't exist
    if (!newAvailability[dayIndex]) {
      newAvailability[dayIndex] = {
        dayOfWeek: dayIndex,
        startTime: '09:00',
        endTime: '17:00',
        isAvailable: false,
        breaks: [],
      };
    }

    newAvailability[dayIndex] = { ...newAvailability[dayIndex], [field]: value };

    // Update local state without saving to context yet
    setLocalAvailability(newAvailability);
    setHasUnsavedChanges(true);
  };

  const handleSaveScheduleChanges = async () => {
    try {
      // Delete existing availability records for this hairstylist
      await supabase.from('hairstylist_availability').delete().eq('hairstylist_id', hairstylist.id);

      // Insert new availability records
      const availabilityToInsert = localAvailability.map(avail => ({
        hairstylist_id: hairstylist.id,
        day_of_week: avail.dayOfWeek,
        start_time: avail.startTime,
        end_time: avail.endTime,
        is_available: avail.isAvailable,
      }));

      if (availabilityToInsert.length > 0) {
        const { error } = await supabase
          .from('hairstylist_availability')
          .insert(availabilityToInsert);

        if (error) throw error;
      }

      // Update local context state
      updateHairstylistAvailability(hairstylist.id, localAvailability);

      setHasUnsavedChanges(false);
      setIsEditingSchedule(false);
      alert('Schedule changes saved successfully to database!');
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Error saving schedule changes. Please try again.');
    }
  };

  const handleAddBreak = (dayIndex: number, breakData: Omit<HairstylistBreak, 'id'>) => {
    const newBreak = { ...breakData, id: `break_${Date.now()}` };
    const newAvailability = [...localAvailability];
    if (newAvailability[dayIndex]) {
      newAvailability[dayIndex] = {
        ...newAvailability[dayIndex],
        breaks: [...(newAvailability[dayIndex].breaks || []), newBreak],
      };
      setLocalAvailability(newAvailability);
      setHasUnsavedChanges(true);
    }
  };

  const handleEditBreak = (dayIndex: number, breakItem: HairstylistBreak) => {
    const newAvailability = [...localAvailability];
    if (newAvailability[dayIndex]) {
      newAvailability[dayIndex] = {
        ...newAvailability[dayIndex],
        breaks: (newAvailability[dayIndex].breaks || []).map(b =>
          b.id === breakItem.id ? breakItem : b
        ),
      };
      setLocalAvailability(newAvailability);
      setHasUnsavedChanges(true);
    }
  };

  const handleDeleteBreak = (dayIndex: number, breakId: string) => {
    const newAvailability = [...localAvailability];
    if (newAvailability[dayIndex]) {
      newAvailability[dayIndex] = {
        ...newAvailability[dayIndex],
        breaks: (newAvailability[dayIndex].breaks || []).filter(b => b.id !== breakId),
      };
      setLocalAvailability(newAvailability);
      setHasUnsavedChanges(true);
    }
  };

  const handleAddTimeOff = (timeOffData: Omit<HairstylistTimeOff, 'id'>) => {
    // TODO: Implement time off persistence when updateHairstylist is available
    console.log('Time off data to save:', timeOffData);
    alert('Time off functionality requires database integration. Coming soon!');
  };

  const handleEditTimeOff = (timeOff: HairstylistTimeOff) => {
    // TODO: Implement time off persistence when updateHairstylist is available
    console.log('Time off data to edit:', timeOff);
    alert('Time off functionality requires database integration. Coming soon!');
  };

  const handleDeleteTimeOff = (timeOffId: string) => {
    // TODO: Implement time off persistence when updateHairstylist is available
    console.log('Time off to delete:', timeOffId);
    alert('Time off functionality requires database integration. Coming soon!');
  };

  const handleCommissionChange = (
    serviceId: string,
    type: 'percentage' | 'fixed',
    value: number
  ) => {
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
    const category = formData.get('category') as
      | 'cutting'
      | 'coloring'
      | 'styling'
      | 'treatment'
      | 'other';

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
                <img
                  src={hairstylist.photoUrl}
                  alt={hairstylist.name}
                  className="w-full h-full object-cover"
                />
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
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800"
                    >
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
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg"
                    >
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
          <div className="space-y-6">
            {/* Weekly Schedule */}
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{t('team.weeklySchedule')}</h3>
                <div className="flex items-center gap-2">
                  {isEditingSchedule ? (
                    <>
                      <button
                        onClick={() => {
                          setIsEditingSchedule(false);
                          setHasUnsavedChanges(false);
                          setLocalAvailability(hairstylist.availability || []);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveScheduleChanges}
                        disabled={!hasUnsavedChanges}
                        className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors ${
                          hasUnsavedChanges
                            ? 'bg-accent hover:opacity-90'
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setIsEditingSchedule(true);
                        setLocalAvailability(hairstylist.availability || []);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
                    >
                      <EditIcon className="w-4 h-4" />
                      Edit Schedule
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {dayNames.map((dayName, index) => {
                  const availability = localAvailability?.find(a => a.dayOfWeek === index);
                  return (
                    <div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-24 font-medium">
                            {t(`team.days.${dayName.toLowerCase()}`)}
                          </div>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={availability?.isAvailable || false}
                              onChange={e =>
                                handleAvailabilityChange(index, 'isAvailable', e.target.checked)
                              }
                              disabled={!isEditingSchedule}
                              className="rounded"
                            />
                            <span className="text-sm">{t('team.available')}</span>
                          </label>
                        </div>
                        {availability?.isAvailable && isEditingSchedule && (
                          <button
                            onClick={() => {
                              setEditingBreak({
                                dayIndex: index,
                                break: {
                                  id: '',
                                  startTime: '12:00',
                                  endTime: '13:00',
                                  name: 'Lunch Break',
                                  isRecurring: true,
                                },
                              });
                              setIsBreakModalOpen(true);
                            }}
                            className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                          >
                            Add Break
                          </button>
                        )}
                      </div>

                      {availability?.isAvailable && (
                        <>
                          {/* Working Hours */}
                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-sm font-medium">Working Hours:</span>
                            <input
                              type="time"
                              value={availability.startTime}
                              onChange={e =>
                                handleAvailabilityChange(index, 'startTime', e.target.value)
                              }
                              disabled={!isEditingSchedule}
                              className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <span className="text-gray-500">to</span>
                            <input
                              type="time"
                              value={availability.endTime}
                              onChange={e =>
                                handleAvailabilityChange(index, 'endTime', e.target.value)
                              }
                              disabled={!isEditingSchedule}
                              className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>

                          {/* Breaks */}
                          {availability.breaks && availability.breaks.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-2">Breaks:</h5>
                              <div className="space-y-2">
                                {availability.breaks.map(breakItem => (
                                  <div
                                    key={breakItem.id}
                                    className="flex items-center justify-between p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="text-sm font-medium">{breakItem.name}</span>
                                      <span className="text-xs text-gray-500">
                                        {breakItem.startTime} - {breakItem.endTime}
                                      </span>
                                      {breakItem.isRecurring && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                          Daily
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {isEditingSchedule && (
                                        <>
                                          <button
                                            onClick={() => {
                                              setEditingBreak({
                                                dayIndex: index,
                                                break: breakItem,
                                              });
                                              setIsBreakModalOpen(true);
                                            }}
                                            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                                          >
                                            <EditIcon className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => handleDeleteBreak(index, breakItem.id)}
                                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                          >
                                            <TrashIcon className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Off Management */}
            <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{t('team.timeOff')}</h3>
                <button
                  onClick={() => {
                    setEditingTimeOff(null);
                    setIsTimeOffModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
                >
                  <PlusIcon className="w-4 h-4" />
                  Add Time Off
                </button>
              </div>

              {hairstylist.timeOff && hairstylist.timeOff.length > 0 ? (
                <div className="space-y-3">
                  {hairstylist.timeOff.map(timeOff => (
                    <div
                      key={timeOff.id}
                      className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-medium">{timeOff.reason}</h4>
                          {timeOff.isFullDay ? (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                              Full Day
                            </span>
                          ) : (
                            <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              Partial Day
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {timeOff.startDate === timeOff.endDate
                            ? new Date(timeOff.startDate).toLocaleDateString()
                            : `${new Date(timeOff.startDate).toLocaleDateString()} - ${new Date(timeOff.endDate).toLocaleDateString()}`}
                          {!timeOff.isFullDay && timeOff.startTime && timeOff.endTime && (
                            <span className="ml-2">
                              ({timeOff.startTime} - {timeOff.endTime})
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingTimeOff(timeOff);
                            setIsTimeOffModalOpen(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          <EditIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTimeOff(timeOff.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                  {t('team.noTimeOff')}
                </p>
              )}
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
                  <div
                    key={skill.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{skill.name}</h4>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            skill.level === 'expert'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : skill.level === 'advanced'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : skill.level === 'intermediate'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}
                        >
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
                  <div
                    key={service.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">${service.price}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={commission?.type || 'percentage'}
                        onChange={e =>
                          handleCommissionChange(
                            service.id,
                            e.target.value as 'percentage' | 'fixed',
                            commission?.value || 0
                          )
                        }
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
                        onChange={e =>
                          handleCommissionChange(
                            service.id,
                            commission?.type || 'percentage',
                            parseFloat(e.target.value) || 0
                          )
                        }
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
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('team.totalRevenue')}
                        </p>
                        <p className="text-xl font-bold">${performance.totalRevenue.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <ClipboardListIcon className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('team.totalAppointments')}
                        </p>
                        <p className="text-xl font-bold">{performance.totalAppointments}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <StarIcon className="w-8 h-8 text-yellow-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('team.averageRating')}
                        </p>
                        <p className="text-xl font-bold">{performance.averageRating.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <DollarSignIcon className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('team.totalCommission')}
                        </p>
                        <p className="text-xl font-bold">
                          ${performance.totalCommission.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
                  <h3 className="text-xl font-semibold mb-4">{t('team.topServices')}</h3>
                  {performance.topServices.length > 0 ? (
                    <div className="space-y-3">
                      {performance.topServices.map((serviceData, index) => (
                        <div
                          key={serviceData.serviceId}
                          className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg"
                        >
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
                    <p className="text-gray-500 dark:text-gray-400">
                      {t('team.noPerformanceData')}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50 text-center">
                <BarChartIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {t('team.noPerformanceData')}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {t('team.performanceWillAppear')}
                </p>
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
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
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
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
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
                <label
                  htmlFor="level"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
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

      {/* Break Modal */}
      {isBreakModalOpen && editingBreak && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
            <button
              onClick={() => {
                setIsBreakModalOpen(false);
                setEditingBreak(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingBreak.break.id ? 'Edit Break' : 'Add Break'}
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const name = formData.get('name') as string;
                const startTime = formData.get('startTime') as string;
                const endTime = formData.get('endTime') as string;
                const isRecurring = formData.get('isRecurring') === 'on';

                if (editingBreak.break.id) {
                  handleEditBreak(editingBreak.dayIndex, {
                    ...editingBreak.break,
                    name,
                    startTime,
                    endTime,
                    isRecurring,
                  });
                } else {
                  handleAddBreak(editingBreak.dayIndex, {
                    name,
                    startTime,
                    endTime,
                    isRecurring,
                  });
                }
                setIsBreakModalOpen(false);
                setEditingBreak(null);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="breakName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Break Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="breakName"
                  required
                  defaultValue={editingBreak.break.name}
                  placeholder="e.g., Lunch Break, Coffee Break"
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    required
                    defaultValue={editingBreak.break.startTime}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    required
                    defaultValue={editingBreak.break.endTime}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    defaultChecked={editingBreak.break.isRecurring}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Recurring daily break
                  </span>
                </label>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsBreakModalOpen(false);
                    setEditingBreak(null);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
                >
                  {editingBreak.break.id ? 'Save Changes' : 'Add Break'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Time Off Modal */}
      {isTimeOffModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
            <button
              onClick={() => {
                setIsTimeOffModalOpen(false);
                setEditingTimeOff(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingTimeOff ? 'Edit Time Off' : 'Add Time Off'}
            </h2>
            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const reason = formData.get('reason') as string;
                const startDate = formData.get('startDate') as string;
                const endDate = formData.get('endDate') as string;
                const isFullDay = formData.get('isFullDay') === 'on';
                const startTime = formData.get('startTime') as string;
                const endTime = formData.get('endTime') as string;

                const timeOffData = {
                  reason,
                  startDate,
                  endDate,
                  isFullDay,
                  startTime: !isFullDay ? startTime : undefined,
                  endTime: !isFullDay ? endTime : undefined,
                };

                if (editingTimeOff) {
                  handleEditTimeOff({ ...editingTimeOff, ...timeOffData });
                } else {
                  handleAddTimeOff(timeOffData);
                }
                setIsTimeOffModalOpen(false);
                setEditingTimeOff(null);
              }}
              className="space-y-4"
            >
              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Reason
                </label>
                <input
                  type="text"
                  name="reason"
                  id="reason"
                  required
                  defaultValue={editingTimeOff?.reason || ''}
                  placeholder="e.g., Vacation, Sick Leave, Personal"
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    required
                    defaultValue={editingTimeOff?.startDate || ''}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    required
                    defaultValue={editingTimeOff?.endDate || ''}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isFullDay"
                    defaultChecked={editingTimeOff?.isFullDay !== false}
                    className="rounded"
                    onChange={e => {
                      const timeInputs = document.querySelectorAll(
                        '[name="startTime"], [name="endTime"]'
                      ) as NodeListOf<HTMLInputElement>;
                      timeInputs.forEach(input => {
                        input.disabled = e.target.checked;
                        if (e.target.checked) input.value = '';
                      });
                    }}
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Full day time off
                  </span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Time (if partial day)
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    id="startTime"
                    defaultValue={editingTimeOff?.startTime || ''}
                    disabled={editingTimeOff?.isFullDay !== false}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Time (if partial day)
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    id="endTime"
                    defaultValue={editingTimeOff?.endTime || ''}
                    disabled={editingTimeOff?.isFullDay !== false}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTimeOffModalOpen(false);
                    setEditingTimeOff(null);
                  }}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
                >
                  {editingTimeOff ? 'Save Changes' : 'Add Time Off'}
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
