import React from 'react';
import { DataList, Badge } from '@radix-ui/themes';

interface DataTableProps {
    data: Record<string, any>;
    annotations?: Record<string, any>;
    className?: string;
}

const sortByAnnotated = (itemA: [string, string], itemB: [string, string], annotations?: Record<string, any>) => {
    if (!annotations) {
        return 0;
    }
    // Object.entries() returns tuple, so key is item[0]
    const keyA = itemA[0];
    const keyB = itemB[0];
    if (annotations[keyB] && !annotations[keyA]) {
        return 1 // return itemB before itemA
    }

    // return itemA before itemB
    return -1
}

const DataTable: React.FC<DataTableProps> = ({ data, annotations, className }) => (
    <DataList.Root className={className}>
        {Object.entries(data).sort((itemA, itemB) => sortByAnnotated(itemA, itemB, annotations)).map(([key, value]) => (
            <DataList.Item key={key}>
                <DataList.Label>{key} {annotations && annotations[key]}</DataList.Label>
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
