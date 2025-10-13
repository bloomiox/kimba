import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { Hairstylist, HairstylistType } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

interface HairstylistModalProps {
  hairstylist: Hairstylist | null;
  onClose: () => void;
}

const HairstylistModal: React.FC<HairstylistModalProps> = ({ hairstylist, onClose }) => {
  const { addHairstylist, updateHairstylist } = useSettings();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const type = formData.get('type') as HairstylistType;
    if (hairstylist) {
      updateHairstylist({ ...hairstylist, name, type });
    } else {
      addHairstylist({ name, type });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`${hairstylist ? 'Edit' : 'Add'} Hairstylist/Resource`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <Input
            type="text"
            name="name"
            id="name"
            defaultValue={hairstylist?.name}
            required
            className="mt-1"
          />
        </div>
        <div>
          <label htmlFor="type" className="block text-sm font-medium">
            Type
          </label>
          <select
            name="type"
            id="type"
            defaultValue={hairstylist?.type || 'expert'}
            className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg"
          >
            <option value="expert">Expert</option>
            <option value="station">Station</option>
          </select>
        </div>
        <div className="pt-2 flex justify-end gap-3">
          <Button type="button" onClick={onClose} variant="secondary">
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </Modal>
  );
};

export default HairstylistModal;
