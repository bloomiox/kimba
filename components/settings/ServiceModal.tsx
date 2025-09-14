import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import type { Service } from '../../types';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

// FIX: Added parentId to props to allow creating nested services.
interface ServiceModalProps {
    service: Service | null;
    onClose: () => void;
    parentId?: string | null;
}

const ServiceModal: React.FC<ServiceModalProps> = ({ service, onClose, parentId }) => {
    const { addService, updateService } = useSettings();
    
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const duration = parseInt(formData.get('duration') as string, 10);
        const price = parseFloat(formData.get('price') as string);

        if (service) {
            updateService({ ...service, name, duration, price });
        } else {
            // FIX: Added parentId to the new service object.
            addService({ name, duration, price, parentId: parentId ?? null });
        }
        onClose();
    }
    return (
        <Modal isOpen={true} onClose={onClose} title={`${service ? 'Edit' : 'Add'} Service`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">Service Name</label>
                    <Input type="text" name="name" id="name" defaultValue={service?.name} required className="mt-1"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="duration" className="block text-sm font-medium">Duration (min)</label>
                        <Input type="number" name="duration" id="duration" defaultValue={service?.duration} required min="15" step="5" className="mt-1"/>
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium">Price ($)</label>
                        <Input type="number" name="price" id="price" defaultValue={service?.price} required min="0" step="0.01" className="mt-1"/>
                    </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" onClick={onClose} variant="secondary">Cancel</Button>
                    <Button type="submit">Save</Button>
                </div>
            </form>
        </Modal>
    );
};

export default ServiceModal;