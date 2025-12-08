import React, { useState, useEffect } from 'react';
import type { BusinessHours } from '@food-ordering/types';

interface BusinessHoursEditorProps {
    value: BusinessHours[];
    onChange: (hours: BusinessHours[]) => void;
}

const DAYS: BusinessHours['day'][] = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
];

const DAY_LABELS: Record<BusinessHours['day'], string> = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
};

const BusinessHoursEditor: React.FC<BusinessHoursEditorProps> = ({ value, onChange }) => {
    const [hours, setHours] = useState<BusinessHours[]>(value || []);

    useEffect(() => {
        // Initialize with default hours if empty
        if (hours.length === 0) {
            const defaultHours: BusinessHours[] = DAYS.map(day => ({
                day,
                openTime: '09:00',
                closeTime: '22:00',
                isClosed: false,
            }));
            setHours(defaultHours);
            onChange(defaultHours);
        }
    }, []);

    const handleChange = (day: BusinessHours['day'], field: keyof BusinessHours, value: any) => {
        const updatedHours = hours.map(h =>
            h.day === day ? { ...h, [field]: value } : h
        );
        setHours(updatedHours);
        onChange(updatedHours);
    };

    const copyToAll = (day: BusinessHours['day']) => {
        const sourceDayHours = hours.find(h => h.day === day);
        if (!sourceDayHours) return;

        const updatedHours = hours.map(h => ({
            ...h,
            openTime: sourceDayHours.openTime,
            closeTime: sourceDayHours.closeTime,
            isClosed: sourceDayHours.isClosed,
        }));
        setHours(updatedHours);
        onChange(updatedHours);
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">Business Hours</label>
            </div>

            {DAYS.map(day => {
                const dayHours = hours.find(h => h.day === day) || {
                    day,
                    openTime: '09:00',
                    closeTime: '22:00',
                    isClosed: false,
                };

                return (
                    <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-28">
                            <span className="text-sm font-medium text-gray-700">
                                {DAY_LABELS[day]}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={!dayHours.isClosed}
                                onChange={(e) => handleChange(day, 'isClosed', !e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="text-sm text-gray-600">Open</span>
                        </div>

                        {!dayHours.isClosed && (
                            <>
                                <input
                                    type="time"
                                    value={dayHours.openTime}
                                    onChange={(e) => handleChange(day, 'openTime', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                    type="time"
                                    value={dayHours.closeTime}
                                    onChange={(e) => handleChange(day, 'closeTime', e.target.value)}
                                    className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                            </>
                        )}

                        {!dayHours.isClosed && (
                            <button
                                type="button"
                                onClick={() => copyToAll(day)}
                                className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Copy to all
                            </button>
                        )}

                        {dayHours.isClosed && (
                            <span className="ml-auto text-sm text-gray-500 italic">Closed</span>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default BusinessHoursEditor;
