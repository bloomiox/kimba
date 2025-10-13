import React, { useState, useMemo } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import {
  UsersIcon,
  PlusIcon,
  CloseIcon,
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
  FilterIcon,
} from './common/Icons';
import type {
  Hairstylist,
  Service,
  HairstylistSkill,
  HairstylistAvailability,
  HairstylistCommission,
  HairstylistPerformance,
} from '../types';

import HairstylistDetailPage from './team/HairstylistDetailPage';
import TeamAnalytics from './team/TeamAnalytics';

const getSkillLevelClass = (level: string) => {
  switch (level) {
    case 'expert':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'advanced':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'intermediate':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const TeamPage: React.FC = () => {
  const { hairstylists, services, addHairstylist, updateHairstylist, deleteHairstylist, t } =
    useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHairstylist, setSelectedHairstylist] = useState<Hairstylist | null>(null);
  const [editingHairstylist, setEditingHairstylist] = useState<Hairstylist | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'expert' | 'station'>('all');
  const [activeView, setActiveView] = useState<'team' | 'analytics'>('team');

  const filteredHairstylists = useMemo(() => {
    return hairstylists
      .filter(stylist => {
        const matchesSearch = stylist.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || stylist.type === filterType;
        const isActive = stylist.isActive !== false; // Show active by default
        return matchesSearch && matchesType && isActive;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [hairstylists, searchTerm, filterType]);

  const handleAddHairstylist = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as 'expert' | 'station';
    const photoUrl = formData.get('photoUrl') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const hireDate = formData.get('hireDate') as string;

    if (name && type) {
      if (editingHairstylist) {
        updateHairstylist({
          ...editingHairstylist,
          name,
          type,
          photoUrl: photoUrl || undefined,
          email: email || undefined,
          phone: phone || undefined,
          hireDate: hireDate || undefined,
        });
        setEditingHairstylist(null);
      } else {
        addHairstylist({
          name,
          type,
          photoUrl: photoUrl || undefined,
          email: email || undefined,
          phone: phone || undefined,
          hireDate: hireDate || undefined,
          serviceIds: [],
          skills: [],
          availability: [],
          commissions: [],
          performance: [],
          isActive: true,
        });
      }
      setIsModalOpen(false);
    }
  };

  const handleEdit = (hairstylist: Hairstylist) => {
    setEditingHairstylist(hairstylist);
    setIsModalOpen(true);
    setSelectedHairstylist(null);
  };

  const handleDelete = (hairstylist: Hairstylist) => {
    if (confirm(t('team.confirmDelete', { name: hairstylist.name }))) {
      deleteHairstylist(hairstylist.id);
      setSelectedHairstylist(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingHairstylist(null);
  };

  if (selectedHairstylist) {
    return (
      <HairstylistDetailPage
        hairstylist={selectedHairstylist}
        onBack={() => setSelectedHairstylist(null)}
        onEdit={() => handleEdit(selectedHairstylist)}
        onDelete={() => handleDelete(selectedHairstylist)}
      />
    );
  }

  return (
    <div className="animate-fade-in h-full flex flex-col">
      <div className="flex-shrink-0 space-y-4 mb-6">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-bold">{t('team.title')}</h2>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => setActiveView('team')}
                className={
                  activeView === 'team'
                    ? 'px-4 py-2 rounded-md font-medium transition-colors bg-white dark:bg-gray-700 text-accent shadow-sm'
                    : 'px-4 py-2 rounded-md font-medium transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              >
                <UsersIcon className="w-4 h-4 inline mr-2" />
                {t('team.title')}
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={
                  activeView === 'analytics'
                    ? 'px-4 py-2 rounded-md font-medium transition-colors bg-white dark:bg-gray-700 text-accent shadow-sm'
                    : 'px-4 py-2 rounded-md font-medium transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }
              >
                <BarChartIcon className="w-4 h-4 inline mr-2" />
                {t('team.analytics.title')}
              </button>
            </div>
          </div>
          {activeView === 'team' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
            >
              <PlusIcon className="w-5 h-5" />
              <span className="hidden sm:inline">{t('team.addHairstylist')}</span>
            </button>
          )}
        </div>

        {activeView === 'team' && (
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="text"
              placeholder={t('team.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 min-w-64 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
            />

            <div className="flex items-center gap-2">
              <FilterIcon className="w-5 h-5 text-gray-500" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value as 'all' | 'expert' | 'station')}
                className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <option value="all">{t('team.allTypes')}</option>
                <option value="expert">{t('team.expert')}</option>
                <option value="station">{t('team.station')}</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto">
        {activeView === 'analytics' ? (
          <TeamAnalytics />
        ) : (
          <div className="bg-white dark:bg-gray-800/50 p-4 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            {filteredHairstylists.length > 0 ? (
              <div className="space-y-3">
                {filteredHairstylists.map(hairstylist => {
                  const assignedServicesCount = hairstylist.serviceIds?.length || 0;
                  const skillsCount = hairstylist.skills?.length || 0;
                  const topSkill = hairstylist.skills?.[0];

                  return (
                    <button
                      key={hairstylist.id}
                      onClick={() => setSelectedHairstylist(hairstylist)}
                      className="w-full flex items-center justify-between p-4 bg-gray-100/50 dark:bg-gray-900/40 hover:bg-gray-100 dark:hover:bg-gray-900/80 rounded-lg transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                          {hairstylist.photoUrl ? (
                            <img
                              src={hairstylist.photoUrl}
                              alt={hairstylist.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                          )}
                          {hairstylist.type === 'expert' && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                              <StarIcon className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {hairstylist.name}
                            </p>
                            {topSkill && (
                              <span
                                className={
                                  'px-2 py-1 text-xs rounded-full ' +
                                  getSkillLevelClass(topSkill.level)
                                }
                              >
                                {t(`team.skillLevels.${topSkill.level}`)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {hairstylist.type === 'expert' ? t('team.expert') : t('team.station')}
                          </p>
                          {hairstylist.email && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {hairstylist.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                          <p>
                            {assignedServicesCount} {t('team.servicesAssigned')}
                          </p>
                          <p>
                            {skillsCount} {t('team.skills')}
                          </p>
                        </div>
                        <ChevronRightIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <UsersIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {t('team.empty.title')}
                </p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {searchTerm ? t('team.empty.searchSubtitle') : t('team.empty.subtitle')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg p-6 relative animate-fade-in">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 dark:hover:text-white"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingHairstylist ? t('team.modal.editTitle') : t('team.modal.addTitle')}
            </h2>
            <form onSubmit={handleAddHairstylist} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('team.modal.name')}
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    defaultValue={editingHairstylist?.name || ''}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('team.modal.type')}
                  </label>
                  <select
                    name="type"
                    id="type"
                    required
                    defaultValue={editingHairstylist?.type || 'expert'}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  >
                    <option value="expert">{t('team.expert')}</option>
                    <option value="station">{t('team.station')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('team.modal.email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    defaultValue={editingHairstylist?.email || ''}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t('team.modal.phone')}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    defaultValue={editingHairstylist?.phone || ''}
                    className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="hireDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('team.modal.hireDate')}
                </label>
                <input
                  type="date"
                  name="hireDate"
                  id="hireDate"
                  defaultValue={editingHairstylist?.hireDate?.split('T')[0] || ''}
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>

              <div>
                <label
                  htmlFor="photoUrl"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  {t('team.modal.photoUrl')}
                </label>
                <input
                  type="url"
                  name="photoUrl"
                  id="photoUrl"
                  defaultValue={editingHairstylist?.photoUrl || ''}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg font-semibold text-gray-800 dark:text-gray-200"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent hover:opacity-90 rounded-lg font-semibold text-white"
                >
                  {editingHairstylist ? t('common.save') : t('team.modal.add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;
