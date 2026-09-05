import type { ColumnOptions, ForeignKey, TableType } from "./types.js";
import type { SQLType } from "./SQLType.js";
export declare class Table {
    private name;
    private version;
    private columns;
    private primaryKey?;
    private indexes;
    private foreignKeys;
    private comment?;
    constructor(name: string);
    setVersion(version: number): this;
    addColumn(name: string, type: SQLType, options?: ColumnOptions): this;
    removeColumn(name: string): this;
    setPK(name: string | string[]): this;
    addIndex(columns: string | string[], name?: string): this;
    addUnique(columns: string | string[], name?: string): this;
    addForeignKey(columns: string | string[], referenceTable: string | TableType, referenceColumns: string | string[], options?: {
        onDelete?: ForeignKey["onDelete"];
        onUpdate?: ForeignKey["onUpdate"];
    }): this;
    setComment(comment: string): this;
    build(): TableType;
    toJSON(): TableType;
    toSQL(): string;
    findOldVersions(tables: string[]): number[];
    findOldTables(tables: string[]): string[];
    isCurrentVersionEsist(tables: string[]): boolean;
    getTableName(): string;
    private getVersionPattern;
    private validateColumns;
    private escape;
    private formatValue;
}
//# sourceMappingURL=Table.d.ts.map