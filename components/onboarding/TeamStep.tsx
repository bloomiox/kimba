import React from 'react';
import { PlusIcon, UserIcon, TrashIcon } from '../common/Icons';
import { mapToAccentColor } from '../../utils/colorUtils';
import type { TeamStepProps } from './types';

const TeamStep: React.FC<TeamStepProps> = ({ data, updateData }) => {
  const addMember = () => {
    updateData({
      teamMembers: [...data.teamMembers, { name: '', type: 'expert' }],
    });
  };

  const updateMember = (
    index: number,
    field: 'name' | 'type' | 'email' | 'phone',
    value: string
  ) => {
    const updated = [...data.teamMembers];
    updated[index][field] = value;
    updateData({ teamMembers: updated });
  };

  const removeMember = (index: number) => {
    updateData({ teamMembers: data.teamMembers.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Add your team members
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Add hairstylists and staff who will be using the system
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
          <button
            type="button"
            onClick={addMember}
            className={`flex items-center gap-2 px-3 py-1 ${mapToAccentColor('bg-accent-500')} text-white rounded-lg text-sm hover:opacity-90`}
          >
            <PlusIcon className="w-4 h-4" />
            Add Member
          </button>
        </div>

        {data.teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <UserIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No team members added yet</p>
            <p className="text-sm">Click "Add Member" to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.teamMembers.map((member, index) => (
              <div
                key={`${member.name}-${index}`}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <input
                    type="text"
                    value={member.name}
                    onChange={event => updateMember(index, 'name', event.target.value)}
                    placeholder="Full name"
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <select
                    value={member.type}
                    onChange={event => updateMember(index, 'type', event.target.value)}
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  >
                    <option value="expert">Expert Hairstylist</option>
                    <option value="station">Station Hairstylist</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={event => updateMember(index, 'email', event.target.value)}
                    placeholder="Email (optional)"
                    className="p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={member.phone || ''}
                      onChange={event => updateMember(index, 'phone', event.target.value)}
                      placeholder="Phone (optional)"
                      className="flex-1 p-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamStep;
