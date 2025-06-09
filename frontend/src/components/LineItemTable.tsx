import React from 'react';
import { Table } from '@radix-ui/themes';

interface LineItem {
    date: string;
    description: string;
    debit: boolean;
    amount: number;
}

const LineItemTable: React.FC<{ lineItems: LineItem[] }> = ({ lineItems }) => (
    <Table.Root className="w-full mt-6">
        <Table.Header>
            <Table.Row>
                <Table.ColumnHeaderCell className="px-4">Date</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-4">Description</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-4">Type</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell className="px-4">Amount</Table.ColumnHeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {lineItems.map((lineItem, idx) => (
                <Table.Row key={idx}>
                    <Table.Cell className="px-4">{lineItem.date}</Table.Cell>
                    <Table.Cell className="px-4">{lineItem.description}</Table.Cell>
                    <Table.Cell className="px-4">{lineItem.debit ? 'Debit' : 'Credit'}</Table.Cell>
                    <Table.Cell className="px-4">{lineItem.amount}</Table.Cell>
                </Table.Row>
            ))}
        </Table.Body>
    </Table.Root>
);

export default LineItemTable;
