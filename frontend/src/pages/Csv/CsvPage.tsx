import React, { useState } from 'react';

interface LineItem {
    date: string;
    description: string;
    debit: boolean;
    amount: number
}

const CsvPage = () => {
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<string[][]>([]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const rows = text.split('\n').map(row => row.split(','));
                setCsvData(rows);
            };
            reader.readAsText(selectedFile);
        } else {
            console.error('Please upload a valid CSV file.');
        }
    };

    const transformCsvToJson = (csvData: string[][]): LineItem[] => {
        return csvData.reduce((result, row) => {
            if (row.length >= 6) {
                const date = row[1]?.replace(/-/g, '');
                const description = row[2]?.trim();
                const debit = row[5]?.toLowerCase().includes('debit');
                const amount = parseFloat(row[6]?.replace(/[^0-9.-]+/g, ''));

                if (date && description && !isNaN(amount)) {
                    result.push({ date, description, debit, amount });
                }
            }
            return result;
        }, [] as LineItem[]);
    };

    // Example usage of transformCsvToJson
    const transformedData = transformCsvToJson(csvData);
    console.log(transformedData);

    return (
        <div className="page">
            <h1>CSV solution</h1>
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
            />
            {file && <p>Uploaded file: {file.name}</p>}

            {csvData.length > 0 && (
                <div className="flex flex-col space-y-2 mt-4">
                    {csvData.map((row, rowIndex) => (
                        <div key={rowIndex} className="flex space-x-4">
                            {row.map((cell, cellIndex) => (
                                <div key={cellIndex} className="border-right-1 p-2">{cell}</div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default CsvPage;