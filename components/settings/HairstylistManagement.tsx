import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon, EditIcon, TrashIcon } from '../common/Icons';
import type { Hairstylist } from '../../types';
import HairstylistModal from './HairstylistModal';
import { mapToAccentColor } from '../../utils/colorUtils';

const HairstylistManagement: React.FC = () => {
    const { hairstylists, deleteHairstylist } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingHairstylist, setEditingHairstylist] = useState<Hairstylist | null>(null);

    const handleOpenModal = (hairstylist: Hairstylist | null = null) => {
        setEditingHairstylist(hairstylist);
        setIsModalOpen(true);
    }

    const handleDelete = (hairstylistId: string) => {
        if (window.confirm('Are you sure you want to delete this hairstylist? This may affect existing appointments.')) {
            deleteHairstylist(hairstylistId);
        }
    }
    
    return (
        <>
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-xl font-semibold ${mapToAccentColor('text-blue-500')}`}>Manage Hairstylists</h3>
                    <Button onClick={() => handleOpenModal()} variant="secondary" className="text-sm">
                        <PlusIcon className="w-4 h-4"/> Add New
                    </Button>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {hairstylists.map(h => (
                        <div key={h.id} className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded-lg">
                            <div>
                                <p className="font-semibold">{h.name}</p>
                                <p className="text-sm text-gray-500 capitalize">{h.type}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => handleOpenModal(h)} className={`text-gray-500 hover:${mapToAccentColor('text-blue-500')}`}><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(h.id)} className="text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
            {isModalOpen && <HairstylistModal hairstylist={editingHairstylist} onClose={() => setIsModalOpen(false)} />}
        </>
    );
};

export default HairstylistManagement;
