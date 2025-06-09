import React, { useState } from 'react';
import { Heading, Text, Button, Flex, Spinner } from '@radix-ui/themes';
import { CodeIcon, MagicWandIcon, UploadIcon } from '@radix-ui/react-icons';
import ClassifiedData from '../../components/ClassifiedData';
import DesiredCategories from '../../components/DesiredCategories';
import LineItemTable from '../../components/LineItemTable';
import AiIcon from '../../components/AiIcon';

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

const tagLineItemsWithClassification = (lineItems: LineItem[], classifiedData: Record<string, string>): LineItem[] => {
    return lineItems.map(item => {
        return {
            ...item,
            category: classifiedData[item.description] || 'Uncategorized' // Default to 'Uncategorized' if no classification found
        };
    });
}

const DEFAULT_DESIRED_CATEGORIES = ["Mortgage", "Strata Fees", "Storage Rental", "Electric Bill", "Internet Bill", "Property Tax", "Home Insurance", "Misc. Home improvement", "Food", "debit", "Gimbap Insurance", "Pet food", "Vet", "EV charging+ parking", "Car insurance", "Car maintenance", "Other", "Entertainment", "Vacation planning", "shopping", "Uncategorized"]
const CsvPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [classifying, setClassifying] = useState<boolean>(false);
    const [desiredCategories, setDesiredCategories] = useState<string[]>(DEFAULT_DESIRED_CATEGORIES);
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

        // Prepare req data
        const requestBody = {
            line_items: lineItems,
            desired_categories: desiredCategories,
        }

        // make the API call
        const result = await fetch('/api/csv/classify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        if (result.ok) {
            const classifiedData = await result.json();
            // TODO: classifiedData is { [description]: category } currently, maybe add a a debug to include original confidence
            const taggedLineItems = tagLineItemsWithClassification(lineItems, classifiedData.classified_items);
            setLineItems(taggedLineItems);
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
            <DesiredCategories categories={desiredCategories} setCategories={setDesiredCategories} />

            <input
                className="hidden"
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
            />
            <Flex gapX="2" align="center" mb="3">
                <Button color="cyan" variant="soft" radius="large" onClick={handleButtonClick}>
                    <UploadIcon /> Upload CSV
                </Button>
                {file && <Text as="p">Uploaded file: {file.name}</Text>}
            </Flex>

            {lineItems.length > 0 && (
                <Button
                    color="indigo" variant="soft" radius="large"
                    onClick={handleClassifyCsvClick}>
                    <Spinner loading={classifying}><MagicWandIcon /></Spinner> Auto Categorize
                </Button>
            )}

            {/* Table */}
            {lineItems.length > 0 && <LineItemTable lineItems={lineItems} />}
        </div >
    )
}

export default CsvPage;