import React from 'react';
import { DataList, Flex, Text, TextProps } from '@radix-ui/themes';

interface DataTableProps {
    data: Record<string, any>;
    className?: string;
    keyAnnotations?: Record<string, any>;
    keyTextProps?: Record<string, TextProps>;
    valueTextProps?: Record<string, TextProps>
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

const DataTable: React.FC<DataTableProps> = ({
    data,
    className,
    keyAnnotations = {},
    keyTextProps = {},
    valueTextProps = {}
}) => (
    <DataList.Root className={className} orientation={{ initial: 'vertical', 'xs': 'horizontal' }}>
        {Object.entries(data).sort((itemA, itemB) => sortByAnnotated(itemA, itemB, keyAnnotations)).map(([key, value]) => (
            <DataList.Item key={key}>
                <DataList.Label>
                    <Flex wrap="wrap" align="center">
                        <Text weight="light" color="gray" {...Object.assign({}, keyTextProps[key])}>{key}</Text>
                        {keyAnnotations[key]}
                    </Flex>
                </DataList.Label>
                <DataList.Value>
                    <Text {...Object.assign({}, valueTextProps[value])}>{value}</Text>
                </DataList.Value>
            </DataList.Item>
        ))}
    </DataList.Root>
);

export default DataTable;
