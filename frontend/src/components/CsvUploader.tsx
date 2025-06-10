import React, { useState } from "react"
import { UploadIcon } from "@radix-ui/react-icons"
import { Button, Text } from "@radix-ui/themes"

interface CsvUploaderProps {
    handleCsvFileChanged: (event: React.ChangeEvent<HTMLInputElement>) => void
}
const CsvUploader = React.forwardRef<HTMLInputElement, CsvUploaderProps>(({
    handleCsvFileChanged,
}, ref) => {

    const [file, setFile] = useState<File | null>(null);

    const handleButtonClick = () => {
        if (ref && typeof ref !== 'function' && ref.current) {
            ref.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        handleCsvFileChanged(event);

        const selectedFile = event.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
        }
    }

    return (
        <>
            {file && <Text as="p">Uploaded file: {file.name}</Text>}
            <Button color="cyan" variant="soft" radius="large" onClick={handleButtonClick}>
                <UploadIcon /> Upload CSV
            </Button>
            {/* hidden file input */}
            <input
                className="hidden"
                ref={ref}
                type="file"
                accept=".csv"
                multiple={false}
                onChange={handleFileChange}
            />
        </>
    )
});

export default CsvUploader;
