import { Cross1Icon, PlusIcon } from '@radix-ui/react-icons';
import { Box, IconButton, Button, TextField } from '@radix-ui/themes';
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

    const handleRemoveAll = () => {
        setCategories([]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInput(e.target.value);
    };

    const addCategory = () => {
        setCategories(Array.from(new Set([...categories, input.trim()])));
        setInput('');
    }

    const handleAddCategory = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        addCategory();
    };

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && input.trim()) {
            addCategory();
        }
    };

    return (
        <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
                {categories.map((cat, idx) => (
                    <span key={cat} className="inline-flex items-center bg-gray-200 rounded px-2 py-1 text-sm">
                        {cat}
                        <IconButton variant="ghost" size="1" ml="2" onClick={() => handleRemove(idx)} color="crimson">
                            <Cross1Icon />
                        </IconButton>
                    </span>
                ))}
            </div>
            <Box width="80%">
                <TextField.Root placeholder="Add category..." value={input} onChange={handleInputChange} onKeyDown={handleInputKeyDown}>
                    <TextField.Slot pr="3">
                        <IconButton variant="ghost" onClick={handleAddCategory} disabled={!input.trim()}>
                            <PlusIcon />
                        </IconButton>
                    </TextField.Slot>
                    <TextField.Slot>
                        <Button variant="ghost" onClick={handleRemoveAll} color="crimson">
                            Clear all <Cross1Icon />
                        </Button>
                    </TextField.Slot>
                </TextField.Root>
            </Box>
        </div >
    );
};

export default DesiredCategories;
