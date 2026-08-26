export type ColumnOptions = {
    AUTO_INCREMENT?: boolean;
    ALLOW_NULL?: boolean;
    UNIQUE?: boolean;
    DEFAULT?: boolean;
    DEFAULT_VALUE?: unknown;
    COMMENT?: string;
};
export type Column = {
    name: string;
    type: string;
    options: ColumnOptions;
};
export type IndexType = "INDEX" | "UNIQUE";
export type Index = {
    name?: string;
    columns: string[];
    type: IndexType;
};
export type ForeignKey = {
    columns: string[];
    referenceTable: string;
    referenceColumns: string[];
    onDelete?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
    onUpdate?: "CASCADE" | "SET NULL" | "RESTRICT" | "NO ACTION";
};
export type TableType = {
    name: string;
    version: number;
    columns: Column[];
    primaryKey?: string[];
    indexes: Index[];
    foreignKeys: ForeignKey[];
    comment?: string;
};
//# sourceMappingURL=types.d.ts.map