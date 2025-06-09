import React from 'react';

const DesiredCategories: React.FC<{
    categories: string[];
    setCategories: (categories: string[]) => void;
}> = ({ categories, setCategories }) => {
    const [input, setInput] = React.useState('');

    const handleRemove = (idx: number) => {
        const newArr = categories.filter((_, i) => i !== idx);
        setCategories(Array.from(new Set(newArr)));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            setCategories(Array.from(new Set([...categories, input.trim()])));
            setInput('');
        }
    };

    return (
        <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((cat, idx) => (
                    <span key={cat} className="inline-flex items-center bg-gray-200 rounded px-2 py-1 text-sm">
                        {cat}
                        <button
                            className="ml-1 text-gray-500 hover:text-red-500 focus:outline-none"
                            onClick={() => handleRemove(idx)}
                            aria-label={`Remove ${cat}`}
                            type="button"
                        >
                            ×
                        </button>
                    </span>
                ))}
            </div>
            <input
                className="border rounded px-2 py-1"
                type="text"
                placeholder="Add category..."
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
            />
        </div>
    );
};

export default DesiredCategories;
