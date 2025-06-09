import React, { useState } from 'react';
import { Heading, Text, Button, Flex, Spinner, Tabs, Card, RadioGroup, RadioCards, Box } from '@radix-ui/themes';
import { MagicWandIcon, UploadIcon } from '@radix-ui/react-icons';
import DesiredCategories from '../../components/DesiredCategories';
import LineItemTable from '../../components/LineItemTable';
import DataTable from '../../components/DataTable';

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


const transformTdCsvToLineItem = (csvData: string[][]): LineItem[] => {
    return csvData.reduce((result, row) => {
        if (row.length >= 5) {
            const date = _removeQuotes(row[0]?.replace(/-/g, ''));
            const description = _removeQuotes(row[1]?.trim());
            const debit = _removeQuotes(row[2]?.trim()) !== '';
            const amountIdx = debit ? 2 : 3;
            const amount = parseFloat(row[amountIdx]?.replace(/[^0-9.-]+/g, ''));

            if (date && description && !isNaN(amount)) {
                result.push({ date, description, debit, amount });
            }
        }
        return result;
    }, [] as LineItem[]);
};

const transformScotiabankCsvToLineItem = (csvData: string[][]): LineItem[] => {
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

const sumCategories = (lineItems: Array<LineItem & { category?: string }>): Record<string, number> => {
    return lineItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        acc[category] = (acc[category] || 0) + item.amount;
        return acc;
    }, {} as Record<string, number>);
};

const sortAndSumCategories = (summedCategories: Record<string, number>): Record<string, number> => {
    let roundedSummedCategories: Record<string, number> =
        Object.keys(summedCategories)
            // sort categories alphabetically, case-insensitive
            .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
            // create a new object with sorted categories
            .reduce((obj, key) => {
                obj[key] = summedCategories[key];
                return obj;
            }, {} as Record<string, number>);
    for (const category in summedCategories) {
        roundedSummedCategories[category] = parseFloat(summedCategories[category].toFixed(2)); // Round to 2 decimal places
    }

    return roundedSummedCategories;
}

enum Banks {
    SCOTIABANK = 'Scotiabank',
    TD = 'TD',
}
const BankColors = {
    [Banks.SCOTIABANK]: 'red',
    [Banks.TD]: 'green',
} as const;
const CsvTransformerByBank = {
    [Banks.SCOTIABANK]: transformScotiabankCsvToLineItem,
    [Banks.TD]: transformTdCsvToLineItem,
}
const BANK_SELECTION = [Banks.SCOTIABANK, Banks.TD] as const;

const DEFAULT_DESIRED_CATEGORIES = ["Mortgage", "Strata Fees", "Storage Rental", "Electric Bill", "Internet Bill", "Property Tax", "Home Insurance", "Misc. Home improvement", "Food", "debit", "Gimbap Insurance", "Pet food", "Vet", "EV charging+ parking", "Car insurance", "Car maintenance", "Other", "Entertainment", "Vacation planning", "shopping", "Uncategorized"]
const CsvPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [sumByCategory, setSumByCategory] = useState<Record<string, number>>({});
    const [classifying, setClassifying] = useState<boolean>(false);
    const [desiredCategories, setDesiredCategories] = useState<string[]>(DEFAULT_DESIRED_CATEGORIES);
    const [selectedBankIndex, setSelectedBankIndex] = useState<number>(0);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);


    const resetEverything = () => {
        setLineItems([]);
        setFile(null);
        setSumByCategory({})
    }

    const handleSelectedBankIndexChange = (value: string) => {
        resetEverything();

        const index = parseInt(value, 10);
        setSelectedBankIndex(index);
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const rows = text.split('\n').map(row => row.split(','));
                const items = CsvTransformerByBank[BANK_SELECTION[selectedBankIndex]](rows);

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

            // sort and sum the categories
            const summedCategories = sumCategories(taggedLineItems);
            const summedCategoriesWithEmptyEntries = desiredCategories.reduce((acc, category) => {
                acc[category] = summedCategories[category] || 0; // Ensure all desired categories are present
                return acc;
            }, {} as Record<string, number>);
            const roundedSummedCategories = sortAndSumCategories(summedCategoriesWithEmptyEntries);

            setSumByCategory(roundedSummedCategories);
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

            <Box>
                <Box width="50%">
                    <RadioCards.Root
                        defaultValue={selectedBankIndex.toString()}
                        onValueChange={handleSelectedBankIndexChange}
                        variant="classic"
                        columns={`${BANK_SELECTION.length}`}
                    >
                        {BANK_SELECTION.map((bankName, index) => (
                            <RadioCards.Item key={index} value={index.toString()} className="w-full">
                                <Text color={BankColors[bankName]}>{bankName}</Text>
                            </RadioCards.Item>
                        ))}
                    </RadioCards.Root>
                </Box>

                <Box my="4">
                    {file && <Text as="p">Uploaded file: {file.name}</Text>}
                    <Button color="cyan" variant="soft" radius="large" onClick={handleButtonClick}>
                        <UploadIcon /> Upload CSV
                    </Button>
                    {/* hidden file input */}
                    <input
                        className="hidden"
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileChange}
                    />
                </Box>
            </Box>

            {lineItems.length > 0 && (
                <Button
                    color="indigo" variant="soft" radius="large"
                    onClick={handleClassifyCsvClick}>
                    <Spinner loading={classifying}><MagicWandIcon /></Spinner> Auto Categorize
                </Button>
            )}

            {/* Summed categories */}
            {Object.keys(sumByCategory).length <= 0 ?
                lineItems.length > 0 && <LineItemTable lineItems={lineItems} />
                : (
                    <div className="mt-4">
                        <Tabs.Root defaultValue="LineItems">
                            <Tabs.List>
                                <Tabs.Trigger value="LineItems">Line Items</Tabs.Trigger>
                                <Tabs.Trigger value="SumByCategory">Sum By Category</Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content value="LineItems">
                                <LineItemTable lineItems={lineItems} />
                            </Tabs.Content>

                            <Tabs.Content value="SumByCategory">
                                <div className="my-4">
                                    <DataTable data={sumByCategory} />
                                </div>
                            </Tabs.Content>
                        </Tabs.Root>
                    </div>
                )}
        </div >
    )
}

export default CsvPage;