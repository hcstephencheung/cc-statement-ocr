import React, { useState } from 'react';
import { Table, Heading, Text, Button, Flex, DataList, Badge, Spinner } from '@radix-ui/themes';
import { CodeIcon, UploadIcon } from '@radix-ui/react-icons';

interface LineItem {
    date: string;
    description: string;
    debit: boolean;
    amount: number
}

const _removeQuotes = (str: string): string => {
    const result = str.replace(/^\"/, '').replace(/\"$/, ''); // Clean up quotes if present
    return result
}


const transformCsvToLineItem = (csvData: string[][]): LineItem[] => {
    return csvData.reduce((result, row) => {
        if (row.length >= 6) {
            const date = _removeQuotes(row[1]?.replace(/-/g, ''));
            const description = _removeQuotes(row[2]?.trim());
            const subDescription = _removeQuotes(row[3]?.trim());
            const debit = row[5]?.toLowerCase().includes('debit');
            const amount = parseFloat(row[6]?.replace(/[^0-9.-]+/g, ''));

            if (date && description && !isNaN(amount)) {
                result.push({ date, description, debit, amount });
            }
        }
        return result;
    }, [] as LineItem[]);
};

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

// New component to display classified data
const ClassifiedData: React.FC<{ data: Record<string, any> }> = ({ data }) => (
    <DataList.Root>
        {Object.entries(data).map(([key, value]) => (
            <DataList.Item key={key}>
                <DataList.Label>{key}</DataList.Label>
                <DataList.Value>
                    {Array.isArray(value)
                        ? value.map((item, idx) => (
                            <Badge key={idx} className="mr-1" color="gray">{item.name}</Badge>
                        ))
                        : `${value}`
                    }
                </DataList.Value>
            </DataList.Item>
        ))}
    </DataList.Root>
);

const CsvPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [classifying, setClassifying] = useState<boolean>(false);
    const [classifiedData, setClassifiedData] = useState<{}>({});
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const rows = text.split('\n').map(row => row.split(','));
                const items = transformCsvToLineItem(rows);

                setLineItems(items);
            };
            reader.readAsText(selectedFile);
        } else {
            console.error('Please upload a valid CSV file.');
        }
    };

    const handleButtonClick = () => {
        fileInputRef.current?.click();
    };

    const handleClassifyCsvClick = async () => {
        setClassifying(true);
        const result = await fetch('/api/csv/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ line_items: lineItems }),
        });
        if (result.ok) {
            const classifiedData = await result.json();
            setClassifiedData(classifiedData.classified_items);
        }
        setClassifying(false);
    }

    // TODO: ideal flow
    /**
     * 1. user uploads a CSV, display it in a table
     * 2. create a list, each item is category name that is auto-classified by AI in the backend
     * 3. each sub item is an item from the CSV table, there should be a sum of total
     * 4. export CSV button should export categories with their sums
     */

    return (
        <div className="p-4">
            <Heading as="h1" size="6" mb="4">CSV solution</Heading>
            <input
                className="hidden"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
            />
            <Flex gapX="2" align="center">
                <Button color="cyan" variant="soft" radius="large" onClick={handleButtonClick} mb="3">
                    <UploadIcon /> Upload CSV
                </Button>
                {file && <Text as="p" mb="3">Uploaded file: {file.name}</Text>}
            </Flex>
            {lineItems.length > 0 && <LineItemTable lineItems={lineItems} />}
            {lineItems.length > 0 && (
                <Button
                    color="indigo" variant="soft" radius="large"
                    onClick={handleClassifyCsvClick} my="4">
                    <Spinner loading={classifying}><CodeIcon /></Spinner> Classify CSV
                </Button>
            )}
            {classifiedData && Object.keys(classifiedData).length > 0 && (
                <ClassifiedData data={classifiedData} />
            )}
        </div >
    )
}

export default CsvPage;