export interface LineItem {
    date: string;
    description: string;
    debit: boolean;
    amount: number
}

export interface CategorizedLineItem extends LineItem {
    category: string;
}

export type ClassifiedItem = Record<string, string>;

// export const DEFAULT_DESIRED_CATEGORIES = ["Mortgage", "Strata Fees", "Storage Rental", "Electric Bill", "Internet Bill", "Property Tax", "Home Insurance", "Misc. Home improvement", "Food", "debit", "Gimbap Insurance", "Pet food", "Vet", "EV charging+ parking", "Car insurance", "Car maintenance", "Other", "Entertainment", "Vacation planning", "shopping", "uncategorized"]
export const DEFAULT_DESIRED_CATEGORIES = ["shopping", "food", "entertainment", "debit", "groceries", "utility", "tech services"]
export const UNCATEGORIZED = 'uncategorized';