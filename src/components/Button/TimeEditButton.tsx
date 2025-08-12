import React, { useState } from 'react';

interface TimeEditButtonProps {
    value?: string;
    placeholder: string;
    onChange: (val: string) => void;
}

export const TimeEditButton = (props: TimeEditButtonProps) => {
    const { value, placeholder, onChange } = props;
    
    const [editing, setEditing] = useState(false);
    const [inputValue, setInputValue] = useState(value || '');

    React.useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    const handleBlur = () => {
        setEditing(false);
        onChange(inputValue.trim());
    };

    return editing ? (
        <input
            type="text"
            autoFocus
            value={inputValue}
            onChange={e => setInputValue(e.target.value.replace(/[^0-9:]/g, ''))}
            onBlur={handleBlur}
            onKeyDown={e => {
                if (e.key === 'Enter') {
                    setEditing(false);
                    onChange(inputValue.trim());
                }
            }}
            className="w-2/6 p-1 rounded-md bg-white dark:bg-gray-700 border border-blue-400 dark:border-blue-500 text-xs text-center outline-none"
            placeholder={placeholder}
            maxLength={5}
        />
    ) : (
        <button
            type="button"
            className={`w-2/6 p-1 rounded-md border text-xs text-center ${value ? 'bg-blue-100 dark:bg-blue-900 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'}`}
            onClick={() => setEditing(true)}
        >
            {value || placeholder}
        </button>
    );
};

