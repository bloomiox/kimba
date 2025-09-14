import React, { useMemo, useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { BarChartIcon, TrendingUpIcon, DollarSignIcon, UsersIcon, StarIcon, ClockIcon } from '../common/Icons';
import PerformanceTracker from '../../utils/performanceTracker';
import type { Hairstylist } from '../../types';

const TeamAnalytics: React.FC = () => {
  const { hairstylists, sales, appointments, services, t } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [selectedMetric, setSelectedMetric] = useState<'revenue' | 'appointments' | 'commission'>('revenue');

  const performanceComparison = useMemo(() => {
    return PerformanceTracker.comparePerformance(hairstylists, selectedMetric);
  }, [hairstylists, selectedMetric]);

  const teamSummary = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const totalRevenue = hairstylists.reduce((sum, h) => {
      const performance = h.performance?.find(p => p.month === currentMonth);
      return sum + (performance?.totalRevenue || 0);
    }, 0);

    const totalAppointments = hairstylists.reduce((sum, h) => {
      const performance = h.performance?.find(p => p.month === currentMonth);
      return sum + (performance?.totalAppointments || 0);
    }, 0);

    const totalCommission = hairstylists.reduce((sum, h) => {
      const performance = h.performance?.find(p => p.month === currentMonth);
      return sum + (performance?.totalCommission || 0);
    }, 0);

    const averageRating = hairstylists.length > 0 
      ? hairstylists.reduce((sum, h) => {
          const performance = h.performance?.find(p => p.month === currentMonth);
          return sum + (performance?.averageRating || 0);
        }, 0) / hairstylists.length
      : 0;

    return {
      totalRevenue,
      totalAppointments,
      totalCommission,
      averageRating,
      activeStylists: hairstylists.filter(h => h.isActive !== false).length
    };
  }, [hairstylists]);

  const topPerformers = useMemo(() => {
    return performanceComparison.slice(0, 3);
  }, [performanceComparison]);

  const skillsDistribution = useMemo(() => {
    const skillCounts = new Map<string, { count: number; levels: Map<string, number> }>();
    
    hairstylists.forEach(hairstylist => {
      hairstylist.skills?.forEach(skill => {
        const current = skillCounts.get(skill.category) || { count: 0, levels: new Map() };
        current.count++;
        
        const levelCount = current.levels.get(skill.level) || 0;
        current.levels.set(skill.level, levelCount + 1);
        
        skillCounts.set(skill.category, current);
      });
    });

    return Array.from(skillCounts.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      levels: Array.from(data.levels.entries()).map(([level, count]) => ({ level, count }))
    }));
  }, [hairstylists]);

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'revenue': return t('team.totalRevenue');
      case 'appointments': return t('team.totalAppointments');
      case 'commission': return t('team.totalCommission');
      default: return metric;
    }
  };

  const formatValue = (value: number, metric: string) => {
    if (metric === 'revenue' || metric === 'commission') {
      return `$${value.toFixed(2)}`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('team.analytics.title')}</h2>
        <div className="flex items-center gap-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="revenue">{t('team.totalRevenue')}</option>
            <option value="appointments">{t('team.totalAppointments')}</option>
            <option value="commission">{t('team.totalCommission')}</option>
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="month">{t('team.analytics.thisMonth')}</option>
            <option value="quarter">{t('team.analytics.thisQuarter')}</option>
            <option value="year">{t('team.analytics.thisYear')}</option>
          </select>
        </div>
      </div>

      {/* Team Summary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.analytics.activeStylists')}</p>
              <p className="text-xl font-bold">{teamSummary.activeStylists}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <DollarSignIcon className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.totalRevenue')}</p>
              <p className="text-xl font-bold">${teamSummary.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <ClockIcon className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.totalAppointments')}</p>
              <p className="text-xl font-bold">{teamSummary.totalAppointments}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <StarIcon className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.averageRating')}</p>
              <p className="text-xl font-bold">{teamSummary.averageRating.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <DollarSignIcon className="w-8 h-8 text-indigo-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('team.totalCommission')}</p>
              <p className="text-xl font-bold">${teamSummary.totalCommission.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Ranking */}
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{t('team.analytics.performanceRanking')}</h3>
            <BarChartIcon className="w-6 h-6 text-accent" />
          </div>
          
          <div className="space-y-3">
            {performanceComparison.map((item, index) => (
              <div key={item.hairstylist.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500 text-white' :
                    index === 1 ? 'bg-gray-400 text-white' :
                    index === 2 ? 'bg-orange-600 text-white' :
                    'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {item.rank}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                      {item.hairstylist.photoUrl ? (
                        <img src={item.hairstylist.photoUrl} alt={item.hairstylist.name} className="w-full h-full object-cover" />
                      ) : (
                        <UsersIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className="font-medium">{item.hairstylist.name}</span>
                  </div>
                </div>
                <span className="font-bold">{formatValue(item.value, selectedMetric)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skills Distribution */}
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">{t('team.analytics.skillsDistribution')}</h3>
            <StarIcon className="w-6 h-6 text-accent" />
          </div>
          
          <div className="space-y-4">
            {skillsDistribution.map((skill) => (
              <div key={skill.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{t(`team.skillCategories.${skill.category}`)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{skill.count} {t('team.skills')}</span>
                </div>
                <div className="flex gap-1">
                  {skill.levels.map((level) => (
                    <div
                      key={level.level}
                      className={`h-2 rounded-full ${
                        level.level === 'expert' ? 'bg-purple-500' :
                        level.level === 'advanced' ? 'bg-blue-500' :
                        level.level === 'intermediate' ? 'bg-green-500' :
                        'bg-gray-300'
                      }`}
                      style={{ width: `${(level.count / skill.count) * 100}%` }}
                      title={`${level.count} ${t(`team.skillLevels.${level.level}`)}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performers Spotlight */}
      <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUpIcon className="w-6 h-6 text-accent" />
          <h3 className="text-xl font-semibold">{t('team.analytics.topPerformers')}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPerformers.map((performer, index) => {
            const summary = PerformanceTracker.getPerformanceSummary(performer.hairstylist, 3);
            return (
              <div key={performer.hairstylist.id} className="p-4 bg-gradient-to-br from-accent/10 to-accent/5 rounded-xl border border-accent/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                    {performer.hairstylist.photoUrl ? (
                      <img src={performer.hairstylist.photoUrl} alt={performer.hairstylist.name} className="w-full h-full object-cover" />
                    ) : (
                      <UsersIcon className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold">{performer.hairstylist.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">#{performer.rank} {getMetricLabel(selectedMetric)}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>{t('team.analytics.monthlyAverage')}:</span>
                    <span className="font-medium">${summary.monthlyAverage.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('team.totalAppointments')}:</span>
                    <span className="font-medium">{summary.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t('team.averageRating')}:</span>
                    <span className="font-medium">{summary.averageRating.toFixed(1)} ⭐</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TeamAnalytics;