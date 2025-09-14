import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Segment, SegmentFilter } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusIcon, TrashIcon, EditIcon } from '../common/Icons';
import Modal from '../common/Modal';

const SegmentsTab: React.FC = () => {
    const { segments, addSegment, updateSegment, deleteSegment, getSegmentClients, t } = useSettings();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSegment, setEditingSegment] = useState<Segment | null>(null);

    const handleEdit = (segment: Segment) => {
        setEditingSegment(segment);
        setIsModalOpen(true);
    };

    const handleNew = () => {
        setEditingSegment(null);
        setIsModalOpen(true);
    };

    const handleDelete = (id: string) => {
        if(window.confirm(t('marketing.segments.deleteConfirm'))) {
            deleteSegment(id);
        }
    };
    
    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{t('marketing.segments.title')}</h3>
                <Button onClick={handleNew}><PlusIcon className="w-5 h-5"/> {t('marketing.segments.new')}</Button>
            </div>
            
            <Card>
                {segments.length > 0 ? (
                    <div className="space-y-3">
                        {segments.map(segment => (
                           <div key={segment.id} className="p-4 bg-gray-100 dark:bg-gray-900/50 rounded-lg flex justify-between items-center">
                               <div>
                                   <p className="font-bold">{segment.name}</p>
                                   <p className="text-sm text-gray-500">{t('marketing.segments.clients', { count: getSegmentClients(segment).length })}</p>
                               </div>
                               <div className="flex gap-2">
                                   <Button onClick={() => handleEdit(segment)} variant="secondary" className="p-2"><EditIcon className="w-4 h-4"/></Button>
                                   <Button onClick={() => handleDelete(segment.id)} variant="secondary" className="p-2 hover:bg-red-500/20 hover:text-red-500"><TrashIcon className="w-4 h-4"/></Button>
                               </div>
                           </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-gray-500">{t('marketing.segments.empty')}</p>
                )}
            </Card>

            {isModalOpen && <SegmentModal segment={editingSegment} onClose={() => setIsModalOpen(false)} />}
        </div>
    );
};

const SegmentModal: React.FC<{segment: Segment | null, onClose: () => void}> = ({ segment, onClose }) => {
    const { addSegment, updateSegment, t } = useSettings();
    const [name, setName] = useState(segment?.name || '');
    const [filters, setFilters] = useState<SegmentFilter[]>(segment?.filters || [{ field: 'totalSpent', operator: 'gte', value: 100 }]);

    const handleAddFilter = () => {
        setFilters([...filters, { field: 'totalSpent', operator: 'gte', value: 100 }]);
    };
    
    const handleFilterChange = (index: number, newFilter: SegmentFilter) => {
        setFilters(filters.map((f, i) => i === index ? newFilter : f));
    };

    const handleRemoveFilter = (index: number) => {
        setFilters(filters.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name) return;
        const segmentData = { name, filters };
        if (segment) {
            updateSegment({ ...segment, ...segmentData });
        } else {
            addSegment(segmentData);
        }
        onClose();
    };
    
    return (
        <Modal isOpen={true} onClose={onClose} title={segment ? t('marketing.segments.editTitle') : t('marketing.segments.newTitle')}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium">{t('marketing.segments.form.name')}</label>
                    <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg" />
                </div>
                
                <div className="space-y-3">
                    <label className="block text-sm font-medium">{t('marketing.segments.form.filters')}</label>
                    {filters.map((filter, index) => (
                        <FilterRow key={index} filter={filter} onChange={(f) => handleFilterChange(index, f)} onRemove={() => handleRemoveFilter(index)} />
                    ))}
                    <Button type="button" onClick={handleAddFilter} variant="secondary" className="text-sm"><PlusIcon className="w-4 h-4"/> {t('marketing.segments.form.addFilter')}</Button>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                    <Button type="button" onClick={onClose} variant="secondary">{t('common.cancel')}</Button>
                    <Button type="submit">{t('common.save')}</Button>
                </div>
            </form>
        </Modal>
    );
};

const FilterRow: React.FC<{filter: SegmentFilter, onChange: (f: SegmentFilter) => void, onRemove: () => void}> = ({ filter, onChange, onRemove }) => {
    const { t } = useSettings();
    const isDate = filter.field.includes('lastVisit');

    const fields = [
        { id: 'totalSpent', label: t('marketing.segments.fields.totalSpent') },
        { id: 'totalAppointments', label: t('marketing.segments.fields.totalAppointments') },
        { id: 'lastVisitAfter', label: t('marketing.segments.fields.lastVisitAfter') },
        { id: 'lastVisitBefore', label: t('marketing.segments.fields.lastVisitBefore') },
    ];

    return (
        <div className="flex gap-2 items-center">
            <select value={filter.field} onChange={e => onChange({...filter, field: e.target.value as SegmentFilter['field']})} className="p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                {fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
            </select>
            {!isDate && (
                <select value={filter.operator} onChange={e => onChange({...filter, operator: e.target.value as SegmentFilter['operator']})} className="p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm">
                    <option value="gte">&gt;=</option>
                    <option value="lte">&lt;=</option>
                </select>
            )}
            <input 
                type={isDate ? 'date' : 'number'}
                value={filter.value}
                onChange={e => onChange({...filter, value: isDate ? e.target.value : Number(e.target.value)})}
                className="flex-grow p-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
            />
            <button type="button" onClick={onRemove} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><TrashIcon className="w-4 h-4"/></button>
        </div>
    );
};


export default SegmentsTab;