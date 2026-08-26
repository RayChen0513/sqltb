export declare const SQL_TYPE_TEXT = "TEXT";
export declare const SQL_TYPE_INTEGER = "INTEGER";
export declare const SQL_TYPE_BOOLEAN = "BOOLEAN";
export declare const SQL_TYPE_REAL = "REAL";
export declare const SQL_TYPE: {
    readonly TEXT: "TEXT";
    readonly INTEGER: "INTEGER";
    readonly BOOLEAN: "BOOLEAN";
    readonly REAL: "REAL";
    readonly DATETIME: "DATETIME";
    readonly TIMESTAMP: "TIMESTAMP";
    readonly VARCHAR: (length: number) => string;
    readonly CHAR: (length: number) => string;
    readonly DECIMAL: (precision: number, scale: number) => string;
    readonly ENUM: (values: string[] | number[]) => string;
};
export type SQLType = string;
//# sourceMappingURL=SQLType.d.ts.map