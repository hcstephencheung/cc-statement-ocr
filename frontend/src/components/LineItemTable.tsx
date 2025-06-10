import React, { useCallback, useEffect, useState } from 'react';
import { Table } from '@radix-ui/themes';
import TypeableSelect, { TypeableSelectOption } from './TypeableSelect';

interface LineItem {
    date: string;
    description: string;
    debit: boolean;
    amount: number;
    category?: string; // Optional category for classification
}

const hasCategory = (lineItem: LineItem): boolean => {
    return !!(lineItem.category && lineItem.category !== '');
}

const LineItemTable: React.FC<{ lineItems: LineItem[] }> = ({ lineItems }) => {
    const [allOptions, setAllOptions] = useState<TypeableSelectOption[]>([]);

    useEffect(() => {
        const allCategoriesSet = new Set();
        if (hasCategory(lineItems[0])) {
            lineItems.forEach(lineItem => allCategoriesSet.add(lineItem.category));
        }
        const allCategories = Array.from(allCategoriesSet);
        const options = allCategories.map(category => ({ label: category, value: category } as TypeableSelectOption));
        setAllOptions(options);
    }, [lineItems]);

    const handleOnOptionsChange = useCallback((options: TypeableSelectOption[]) => {
        setAllOptions(options);
    }, []);

    const handleSelectedCategoryChange = useCallback((value: string) => {
        console.log(`changed to ${value}`);
    }, [])

    return (
        <Table.Root>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeaderCell className="px-4">Date</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="px-4">Description</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="px-4">Type</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell className="px-4">Amount</Table.ColumnHeaderCell>
                    {hasCategory(lineItems[0]) && <Table.ColumnHeaderCell className="px-4">Category</Table.ColumnHeaderCell>}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {lineItems.map((lineItem, idx) => (
                    <Table.Row key={idx}>
                        <Table.Cell className="px-4">{lineItem.date}</Table.Cell>
                        <Table.Cell className="px-4">{lineItem.description}</Table.Cell>
                        <Table.Cell className="px-4">{lineItem.debit ? 'Debit' : 'Credit'}</Table.Cell>
                        <Table.Cell className="px-4">{lineItem.amount}</Table.Cell>
                        {hasCategory(lineItem) && <Table.Cell className="px-4">
                            <TypeableSelect
                                options={allOptions}
                                defaultOption={{ label: lineItem.category, value: lineItem.category } as TypeableSelectOption}
                                onOptionsChange={handleOnOptionsChange}
                                onSelectedOptionChange={handleSelectedCategoryChange}
                            />
                        </Table.Cell>}
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    );
}

export default LineItemTable;
