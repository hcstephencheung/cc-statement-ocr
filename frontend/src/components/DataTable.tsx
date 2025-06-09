import React from 'react';
import { DataList, Badge } from '@radix-ui/themes';

interface DataTableProps {
    data: Record<string, any>;
    className?: string;
}

const DataTable: React.FC<DataTableProps> = ({ data, className }) => (
    <DataList.Root className={className}>
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

export default DataTable;
