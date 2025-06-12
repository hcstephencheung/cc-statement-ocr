import React, { useState } from 'react';
import { Heading, Button, Spinner, Tabs, Box, Flex, Container } from '@radix-ui/themes';
import { FilePlusIcon, MagicWandIcon, ReloadIcon } from '@radix-ui/react-icons';
import DesiredCategories from '../../components/DesiredCategories';
import LineItemTable from '../../components/LineItemTable';
import DataTable from '../../components/DataTable';
import { BB_CATEGORIES, CategorizedLineItem, DEFAULT_DESIRED_CATEGORIES, Glossary, LineItem } from './types';
import { BankRadioCard, Banks, CsvTransformerByBank } from '../../components/BankRadioCard';
import { tagLineItemsWithClassification, sumCategories, sortAndSumCategories, exportSumsToCsv, sanitizeLineItems, santizeClassifiedItems, buildGlossary, loadTextFileAsObject } from './utils';
import GlossaryTab from '../../components/GlossaryTab';
import FileUploader from '../../components/FileUploader';
import isEqual from 'lodash/isEqual';

const CsvPage = () => {
    const params = new URLSearchParams(window.location.search);
    const isBB = params.get('bb');

    const initialCategories = isBB !== null ? BB_CATEGORIES : DEFAULT_DESIRED_CATEGORIES;
    const [lineItems, setLineItems] = useState<LineItem[]>([]);
    const [categorizedLineItems, setCategorizedLineItems] = useState<CategorizedLineItem[]>([]);
    const [sumByCategory, setSumByCategory] = useState<Record<string, number>>({});
    const [classifying, setClassifying] = useState<boolean>(false);
    const [desiredCategories, setDesiredCategories] = useState<string[]>(initialCategories);
    const [bank, setBank] = useState<Banks>(Banks.SCOTIABANK)
    const [glossary, setGlossary] = useState<Glossary>({})

    const csvFileInputRef = React.useRef<HTMLInputElement | null>(null);
    const glossaryFileInputRef = React.useRef<HTMLInputElement | null>(null);

    const resetEverything = () => {
        setLineItems([]);
        setCategorizedLineItems([]);
        setSumByCategory({});
    };

    const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        resetEverything();

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

    const handleGlossaryFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/plain') {
            const uploadedGlossary = await loadTextFileAsObject(selectedFile);
            // merge the uploaded glossary with current
            const newGlossary = Object.assign({}, glossary, uploadedGlossary);

            const sanitizedLineItems = sanitizeLineItems(lineItems);
            const sanitizedClassifiedItems = santizeClassifiedItems(newGlossary);
            const taggedLineItems = tagLineItemsWithClassification(sanitizedLineItems, sanitizedClassifiedItems);
            setCategorizedLineItems(taggedLineItems);

            const previousCategories = Object.entries(sanitizedClassifiedItems).map(([_, category]) => category);
            const newCategorySet = new Set<string>();
            for (const category of [...desiredCategories, ...previousCategories]) {
                newCategorySet.add(category);
            }
            const newCategories = Array.from(newCategorySet);

            setDesiredCategories(newCategories);
            setGlossary(newGlossary);
        } else {
            console.error('Please upload a valid txt file.');
        }
    }

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
            const aiClassifiedItems = santizeClassifiedItems(classifiedData.classified_items);

            // merge ai classified items to existing glossary if we already have one
            const newGlossary = Object.assign({}, glossary, aiClassifiedItems);

            const taggedLineItems = tagLineItemsWithClassification(sanitizedLineItems, newGlossary);

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

        const newGlossary = buildGlossary(categorizedLineItems, glossary);
        if (!isEqual(glossary, newGlossary)) {
            // only update glossary if it changed to avoid infinite loop
            setGlossary(newGlossary);
        }

        // always re-sort and re-sum the categories
        const summedCategories = sumCategories(categorizedLineItems);
        const roundedSummedCategories = sortAndSumCategories(summedCategories);
        setSumByCategory(roundedSummedCategories);
    }, [categorizedLineItems, desiredCategories, glossary]);

    return (
        <Container width="100%" p="4">
            <Heading as="h1" size="6" mb="4">CSV solution</Heading>

            <Box width="100%">
                <DesiredCategories categories={desiredCategories} setCategories={setDesiredCategories} />
            </Box>

            <Box width="100%">
                <Box>
                    <BankRadioCard
                        bank={bank}
                        setBank={setBank}
                    />
                </Box>

                <Box my="4">
                    <FileUploader
                        ref={csvFileInputRef}
                        acceptedFileType=".csv"
                        handleFileChanged={handleCsvFileChange}
                        uploadBtnText="Upload CSV"
                        showUploadedFileName
                    />
                </Box>
            </Box>

            <Heading as="h3" my="4">Your credit card statement</Heading>
            <Flex gap="2" width="100%" wrap="wrap">
                <Button onClick={() => resetEverything()} color="tomato">
                    <ReloadIcon /> Start over
                </Button>
                {lineItems.length > 0 && (
                    <>
                        <Button
                            color="indigo" variant="soft" radius="large"
                            onClick={handleClassifyCsvClick}
                            disabled={classifying}
                        >
                            <Spinner loading={classifying}><MagicWandIcon /></Spinner> AI Categorize
                        </Button>

                        <FileUploader
                            disabled={classifying}
                            ref={glossaryFileInputRef}
                            acceptedFileType=".txt"
                            handleFileChanged={handleGlossaryFileChange}
                            uploadBtnText="Use previous definitions"
                            showUploadedFileName={false}
                        />
                    </>
                )}
            </Flex>

            <Box width="100%">
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
                                    <Box>
                                        <Button
                                            onClick={() => exportSumsToCsv(sumByCategory)}
                                            my="4"
                                        >
                                            <FilePlusIcon /> Export to CSV
                                        </Button>
                                        <DataTable data={sumByCategory} />
                                    </Box>
                                </Tabs.Content>

                                <Tabs.Content value="Glossary">
                                    <GlossaryTab
                                        glossary={glossary}
                                        categorizedLineItems={categorizedLineItems}
                                    />
                                </Tabs.Content>
                            </Tabs.Root>
                        </div>
                    )}
            </Box>
        </Container>
    )
}

export default CsvPage;