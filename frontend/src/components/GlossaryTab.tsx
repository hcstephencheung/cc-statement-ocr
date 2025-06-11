import { DownloadIcon } from "@radix-ui/react-icons";
import { Button, Box } from "@radix-ui/themes";
import { Glossary } from "../pages/Csv/types";
import DataTable from "./DataTable";
import { saveObjectAsTextFile } from "../pages/Csv/utils";
import React from "react";

interface GlossaryTabProps {
    glossary: Glossary
}
const GlossaryTab = ({
    glossary
}: GlossaryTabProps) => {
    const saveGlossaryToFile = (glossary: Glossary) => {
        saveObjectAsTextFile(glossary)
    }

    return (
        <Box>
            <Button
                onClick={() => saveGlossaryToFile(glossary)}
                my="4"
            >
                <DownloadIcon /> Save definitions
            </Button>
            <DataTable data={glossary} />
        </Box>
    )
}

export default GlossaryTab;
