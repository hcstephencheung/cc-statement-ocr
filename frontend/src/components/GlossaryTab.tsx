import { DownloadIcon } from "@radix-ui/react-icons";
import { Button, Box, Badge } from "@radix-ui/themes";
import { CategorizedLineItem, Glossary } from "../pages/Csv/types";
import DataTable from "./DataTable";
import { saveObjectAsTextFile } from "../pages/Csv/utils";
import React from "react";

interface GlossaryTabProps {
    glossary: Glossary
    categorizedLineItems: CategorizedLineItem[]
}
const GlossaryTab = ({
    glossary,
    categorizedLineItems
}: GlossaryTabProps) => {
    const saveGlossaryToFile = (glossary: Glossary) => {
        saveObjectAsTextFile(glossary)
    }

    const annotations: { [key: string]: React.ReactNode } = {};
    for (const item of categorizedLineItems) {
        if (glossary[item.description]) {
            annotations[item.description] = <Badge color="green" ml="2">In current statement</Badge>
        }
    }

    return (
        <Box>
            <Button
                onClick={() => saveGlossaryToFile(glossary)}
                my="4"
            >
                <DownloadIcon /> Save definitions
            </Button>
            <DataTable data={glossary} annotations={annotations} />
        </Box>
    )
}

export default GlossaryTab;
