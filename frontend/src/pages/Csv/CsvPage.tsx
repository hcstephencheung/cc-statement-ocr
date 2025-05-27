import React, { useState } from 'react';

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
            const debit = row[5]?.toLowerCase().includes('debit');
            const amount = parseFloat(row[6]?.replace(/[^0-9.-]+/g, ''));

            if (date && description && !isNaN(amount)) {
                result.push({ date, description, debit, amount });
            }
        }
        return result;
    }, [] as LineItem[]);
};

const CsvPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [lineItems, setLineItems] = useState<LineItem[]>([]);

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

    return (
        <div className="page">
            <h1>CSV solution</h1>
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && <p>Uploaded file: {file.name}</p>}

            {lineItems.length > 0 && lineItems.map(lineItem => (
                <div className="line-item flex space-x-2">
                    <p className="text-align-center my-4">{lineItem.date}</p>
                    <p className="text-align-center my-4">{lineItem.description}</p>
                    <p className="text-align-center my-4">{lineItem.debit ? 'Debit': 'Credit'}</p>
                    <p className="text-align-center my-4">{lineItem.amount}</p>
                </div>
            ))}
        </div>
    )
}

export default CsvPage;