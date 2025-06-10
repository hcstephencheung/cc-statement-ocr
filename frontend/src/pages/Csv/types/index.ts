export interface LineItem {
    date: string;
    description: string;
    debit: boolean;
    amount: number
}

// export const DEFAULT_DESIRED_CATEGORIES = ["Mortgage", "Strata Fees", "Storage Rental", "Electric Bill", "Internet Bill", "Property Tax", "Home Insurance", "Misc. Home improvement", "Food", "debit", "Gimbap Insurance", "Pet food", "Vet", "EV charging+ parking", "Car insurance", "Car maintenance", "Other", "Entertainment", "Vacation planning", "shopping", "Uncategorized"]
export const DEFAULT_DESIRED_CATEGORIES = ["shopping", "food", "entertainment", "debit", "groceries", "utility", "tech services"]