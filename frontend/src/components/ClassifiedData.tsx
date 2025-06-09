import React from 'react';
import { DataList, Badge } from '@radix-ui/themes';

const ClassifiedData: React.FC<{ data: Record<string, any> }> = ({ data }) => (
    <DataList.Root>
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

export default ClassifiedData;
