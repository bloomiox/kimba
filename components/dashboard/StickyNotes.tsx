import React, { useState } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { PlusIcon, CloseIcon, EditIcon, TrashIcon } from '../common/Icons';
import type { StickyNote } from '../../types';

const StickyNotes: React.FC = () => {
    const { stickyNotes, addStickyNote, updateStickyNote, deleteStickyNote } = useSettings();
    
    // Debug: Log sticky notes data
    console.log('StickyNotes Debug:', {
        stickyNotesCount: stickyNotes?.length || 0,
        stickyNotes: stickyNotes,
        hasAddMethod: typeof addStickyNote === 'function'
    });
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [editingNote, setEditingNote] = useState<StickyNote | null>(null);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteColor, setNewNoteColor] = useState<StickyNote['color']>('yellow');

    const colors = {
        yellow: 'bg-yellow-200 border-yellow-300 text-yellow-900',
        blue: 'bg-blue-200 border-blue-300 text-blue-900',
        green: 'bg-green-200 border-green-300 text-green-900',
        pink: 'bg-pink-200 border-pink-300 text-pink-900',
        purple: 'bg-purple-200 border-purple-300 text-purple-900',
    };

    const handleAddNote = () => {
        if (newNoteContent.trim()) {
            addStickyNote({
                content: newNoteContent.trim(),
                color: newNoteColor,
            });
            setNewNoteContent('');
            setIsAddingNote(false);
        }
    };

    const handleUpdateNote = () => {
        if (editingNote && editingNote.content.trim()) {
            updateStickyNote(editingNote);
            setEditingNote(null);
        }
    };

    const handleDeleteNote = (noteId: string) => {
        if (window.confirm('Are you sure you want to delete this note?')) {
            deleteStickyNote(noteId);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800/50 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Notes</h3>
                <button
                    onClick={() => setIsAddingNote(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Add new note form */}
                {isAddingNote && (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-3">
                        <textarea
                            value={newNoteContent}
                            onChange={(e) => setNewNoteContent(e.target.value)}
                            placeholder="Write your note..."
                            className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 resize-none"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex space-x-1">
                                {Object.keys(colors).map((color) => (
                                    <button
                                        key={color}
                                        onClick={() => setNewNoteColor(color as StickyNote['color'])}
                                        className={`w-6 h-6 rounded-full border-2 ${
                                            newNoteColor === color ? 'border-gray-800 dark:border-white' : 'border-gray-300'
                                        } ${colors[color as keyof typeof colors].split(' ')[0]}`}
                                    />
                                ))}
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setIsAddingNote(false);
                                        setNewNoteContent('');
                                    }}
                                    className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddNote}
                                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                    Add
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Existing notes */}
                {stickyNotes.map((note) => (
                    <div
                        key={note.id}
                        className={`relative p-3 rounded-lg border-2 ${colors[note.color]} group`}
                    >
                        {editingNote?.id === note.id ? (
                            <div>
                                <textarea
                                    value={editingNote.content}
                                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                                    className="w-full p-2 text-sm bg-transparent border border-gray-400 rounded resize-none"
                                    rows={3}
                                    autoFocus
                                />
                                <div className="flex justify-end space-x-2 mt-2">
                                    <button
                                        onClick={() => setEditingNote(null)}
                                        className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateNote}
                                        className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                    <button
                                        onClick={() => setEditingNote(note)}
                                        className="p-1 text-gray-600 hover:text-gray-800 bg-white/80 rounded"
                                    >
                                        <EditIcon className="w-3 h-3" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.id)}
                                        className="p-1 text-red-600 hover:text-red-800 bg-white/80 rounded"
                                    >
                                        <TrashIcon className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-2">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {stickyNotes.length === 0 && !isAddingNote && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">No notes yet</p>
                        <p className="text-xs mt-1">Click the + button to add your first note</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StickyNotes;