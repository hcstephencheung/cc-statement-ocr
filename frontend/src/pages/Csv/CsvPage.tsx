import React, { useState } from 'react';
import { Heading, Button, Spinner, Tabs, Box } from '@radix-ui/themes';
import { FilePlusIcon, MagicWandIcon, ReloadIcon } from '@radix-ui/react-icons';
import DesiredCategories from '../../components/DesiredCategories';
import LineItemTable from '../../components/LineItemTable';
import DataTable from '../../components/DataTable';
import { CategorizedLineItem, DEFAULT_DESIRED_CATEGORIES, Glossary, LineItem } from './types';
import { BankRadioCard, Banks, CsvTransformerByBank } from '../../components/BankRadioCard';
import { tagLineItemsWithClassification, sumCategories, sortAndSumCategories, exportSumsToCsv, sanitizeLineItems, santizeClassifiedItems, buildGlossary } from './utils';
import CsvUploader from '../../components/CsvUploader';

const CsvPage = () => {
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [categorizedLineItems, setCategorizedLineItems] = useState<CategorizedLineItem[]>([]);
    const [sumByCategory, setSumByCategory] = useState<Record<string, number>>({});
    const [classifying, setClassifying] = useState<boolean>(false);
    const [desiredCategories, setDesiredCategories] = useState<string[]>(DEFAULT_DESIRED_CATEGORIES);
    const [bank, setBank] = useState<Banks>(Banks.SCOTIABANK)
    const [glossary, setGlossary] = useState<Glossary>({})


    const fileInputRef = React.useRef<HTMLInputElement | null>(null);

    const resetEverything = () => {
        setLineItems([]);
        setCategorizedLineItems([]);
        setSumByCategory({});
    };

    const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const rows = text.split('\n').map(row => row.split(','));
                const items = CsvTransformerByBank[bank](rows);

                setLineItems(items);
            };
            reader.readAsText(selectedFile);
        } else {
            console.error('Please upload a valid CSV file.');
        }
    };

    const handleClassifyCsvClick = async () => {
        setClassifying(true);

        const sanitizedLineItems = sanitizeLineItems(lineItems);

        // Prepare req data
        const requestBody = {
            line_items: sanitizedLineItems,
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
            const sanitizedClassifiedItems = santizeClassifiedItems(classifiedData.classified_items);
            const taggedLineItems = tagLineItemsWithClassification(sanitizedLineItems, sanitizedClassifiedItems);

            setCategorizedLineItems(taggedLineItems);
        }
        setClassifying(false);
    };

    const updateLineItem = React.useCallback((newLineItem: CategorizedLineItem, idx: number) => {
        const previousLineItem = categorizedLineItems[idx];
        if (!previousLineItem.category || !newLineItem.category) {
            console.error('Cannot update categorized line item without category');
            return;
        }

        const newCategorizedLineItems = [...categorizedLineItems];
        newCategorizedLineItems[idx] = newLineItem;
        setCategorizedLineItems(newCategorizedLineItems);
    }, [categorizedLineItems]);


    // Effect to update data points when categorizedLineItems changes
    // could change from AI categorization or user updates
    React.useEffect(() => {
        if (categorizedLineItems.length === 0 || desiredCategories.length === 0) {
            return;
        }

        // set the glossary
        setGlossary(buildGlossary(categorizedLineItems));

        // sort and sum the categories
        const summedCategories = sumCategories(categorizedLineItems);
        const roundedSummedCategories = sortAndSumCategories(summedCategories);

        setSumByCategory(roundedSummedCategories);
    }, [categorizedLineItems, desiredCategories])

    return (
        <div className="p-4">
            <Heading as="h1" size="6" mb="4">CSV solution</Heading>
            <DesiredCategories categories={desiredCategories} setCategories={setDesiredCategories} />

            <Box>
                <Box width="50%">
                    <BankRadioCard
                        bank={bank}
                        setBank={setBank}
                    />
                </Box>

                <Box my="4">
                    <CsvUploader
                        handleCsvFileChanged={handleCsvFileChange}
                        ref={fileInputRef}
                    />
                </Box>
            </Box>

            <Button onClick={() => resetEverything()}>
                <ReloadIcon /> Start over
            </Button>

            {lineItems.length > 0 && (
                <Button
                    color="indigo" variant="soft" radius="large"
                    onClick={handleClassifyCsvClick}
                    disabled={classifying}
                >
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
                                <Tabs.Trigger value="Glossary">Glossary</Tabs.Trigger>
                            </Tabs.List>

                            <Tabs.Content value="LineItems">
                                <LineItemTable lineItems={categorizedLineItems} updateLineItem={updateLineItem} />
                            </Tabs.Content>

                            <Tabs.Content value="SumByCategory">
                                <div className="my-4">
                                    <Button
                                        onClick={() => exportSumsToCsv(sumByCategory)}
                                        my="4"
                                    >
                                        <FilePlusIcon /> Export to CSV
                                    </Button>
                                    <DataTable data={sumByCategory} />
                                </div>
                            </Tabs.Content>

                            <Tabs.Content value="Glossary">
                                <div className="my-4">
                                    <DataTable data={glossary} />
                                </div>
                            </Tabs.Content>
                        </Tabs.Root>
                    </div>
                )}
        </div >
    )
}

export default CsvPage;