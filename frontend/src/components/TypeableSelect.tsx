import React, { useState } from "react";
import { Select, TextField } from "@radix-ui/themes";

export interface TypeableSelectOption {
    label: string;
    value: string
};

export interface TypeableSelectProps {
    options: TypeableSelectOption[];
    defaultOption: TypeableSelectOption,
    onOptionsChange: (options: TypeableSelectOption[]) => void,
    onSelectedOptionChange: (value: string) => void
}

const TypeableSelect = ({
    options,
    defaultOption,
    onOptionsChange,
    onSelectedOptionChange
}: TypeableSelectProps) => {
    const [textInput, setTextInput] = useState('');

    const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTextInput(e.target.value);
    };

    const addOption = () => {
        const sanitizedTextInput = textInput.trim().toLowerCase();
        const newOption = {
            label: textInput.trim(),
            value: sanitizedTextInput
        }
        if (sanitizedTextInput !== '') {
            onOptionsChange([...options, newOption]);
            setTextInput('');
        }
    }

    const handleTextInputKeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && textInput.trim()) {
            addOption();
            setTextInput('');
        }
    }

    return (
        <Select.Root onValueChange={onSelectedOptionChange} value={defaultOption.value}>
            <TextField.Root placeholder="Add a category..." value={textInput} onChange={handleTextInputChange} onKeyDown={handleTextInputKeydown}>
                <TextField.Slot pl="0">
                    <Select.Trigger variant="soft" color="indigo" />
                </TextField.Slot>
            </TextField.Root>

            <Select.Content position="popper" side="bottom">
                {options.map(option => {
                    return (
                        <Select.Item value={option.value}>{option.label}</Select.Item>
                    )
                })}
            </Select.Content>
        </Select.Root>
    )
}

export default TypeableSelect;