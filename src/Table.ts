import type {
    Column,
    ColumnOptions,
    ForeignKey,
    Index,
    TableType
} from "./types.js";

import type { SQLType } from "./SQLType.js";
import { SQLGenerator } from "./SQLGenerator.js";

// --------------------------------------------------
// Table
// --------------------------------------------------

export class Table {

    private version = 1;

    private columns: Column[] = [];

    private primaryKey?: string[];

    private indexes: Index[] = [];

    private foreignKeys: ForeignKey[] = [];

    private comment?: string;


    constructor(
        private name: string
    ) {
        if (!name.trim()) {
            throw new Error("Table name cannot be empty");
        }
    }


    // --------------------------------------------------
    // Version
    // --------------------------------------------------

    setVersion(version: number): this {

        if (version < 0) {
            throw new Error(
                "Table version cannot be negative"
            );
        }

        this.version = version;

        return this;
    }


    // --------------------------------------------------
    // Column
    // --------------------------------------------------

    addColumn(
        name: string,
        type: SQLType,
        options: ColumnOptions = {}
    ): this {

        if (!name.trim()) {
            throw new Error(
                "Column name cannot be empty"
            );
        }


        if (this.columns.some(
            column => column.name === name
        )) {
            throw new Error(
                `Column "${name}" already exists`
            );
        }


        this.columns.push({
            name,
            type,
            options
        });


        return this;
    }


    removeColumn(
        name: string
    ): this {

        this.columns = this.columns.filter(
            column => column.name !== name
        );

        return this;
    }


    // --------------------------------------------------
    // Primary Key
    // --------------------------------------------------

    setPK(
        name: string | string[]
    ): this {

        const columns = Array.isArray(name)
            ? name
            : [name];


        this.validateColumns(columns);


        this.primaryKey = [...columns];

        return this;
    }


    // --------------------------------------------------
    // Index
    // --------------------------------------------------

    addIndex(
        columns: string | string[],
        name?: string
    ): this {

        const columnList = Array.isArray(columns)
            ? columns
            : [columns];


        this.validateColumns(columnList);


        this.indexes.push({
            name,
            columns: [...columnList],
            type: "INDEX"
        });


        return this;
    }


    // --------------------------------------------------
    // Unique Index
    // --------------------------------------------------

    addUnique(
        columns: string | string[],
        name?: string
    ): this {

        const columnList = Array.isArray(columns)
            ? columns
            : [columns];


        this.validateColumns(columnList);


        this.indexes.push({
            name,
            columns: [...columnList],
            type: "UNIQUE"
        });


        return this;
    }


    // --------------------------------------------------
    // Foreign Key
    // --------------------------------------------------

    addForeignKey(
        columns: string | string[],
        referenceTable: string| TableType,
        referenceColumns: string | string[],
        options: {
            onDelete?: ForeignKey["onDelete"];
            onUpdate?: ForeignKey["onUpdate"];
        } = {}
    ): this {

        const localColumns = Array.isArray(columns)
            ? columns
            : [columns];

        const foreignColumns = Array.isArray(referenceColumns)
            ? referenceColumns
            : [referenceColumns];


        if (
            localColumns.length !==
            foreignColumns.length
        ) {
            throw new Error(
                "Foreign key column count does not match"
            );
        }


        this.validateColumns(localColumns);


        this.foreignKeys.push({
            columns: localColumns,
            referenceTable,
            referenceColumns: foreignColumns,

            onDelete: options.onDelete,
            onUpdate: options.onUpdate
        });


        return this;
    }


    // --------------------------------------------------
    // Table Comment
    // --------------------------------------------------

    setComment(
        comment: string
    ): this {

        this.comment = comment;

        return this;
    }


    // --------------------------------------------------
    // Build
    // --------------------------------------------------

    build(): TableType {

        return {
            name: this.name,

            version: this.version,

            columns: [...this.columns],

            primaryKey: this.primaryKey
                ? [...this.primaryKey]
                : undefined,

            indexes: this.indexes.map(index => ({
                ...index,
                columns: [...index.columns]
            })),

            foreignKeys: this.foreignKeys.map(key => ({
                ...key,
                columns: [...key.columns],
                referenceColumns: [
                    ...key.referenceColumns
                ]
            })),

            comment: this.comment
        };
    }


    // --------------------------------------------------
    // JSON
    // --------------------------------------------------

    toJSON(): TableType {
        return this.build();
    }


    // --------------------------------------------------
    // SQL
    // --------------------------------------------------

    toSQL(): string {

        return SQLGenerator.createTable(
            this.build()
        );
    }


    // --------------------------------------------------
    // Validation
    // --------------------------------------------------

    findOldVersions(tables: string[]): number[] {
        const tablePrefix = this.getVersionPattern();
        const tableVersions = tables
            .map((tableName) => tableName.match(tablePrefix)?.[1])
            .filter((version): version is string => Boolean(version))
            .map((version) => Number.parseFloat(version));

        return tableVersions.filter((version) => version < this.version);
    }

    findOldTables(tables: string[]): string[] {
        const oldTableVersions = this.findOldVersions(tables);

        return oldTableVersions.map(
            (version) => `${this.name}_v${version.toString()}`
        );
    }

    isCurrentVersionEsist(tables: string[]): boolean {
        const tablePrefix = this.getVersionPattern();
        const tableVersions = tables
            .map((tableName) => tableName.match(tablePrefix)?.[1])
            .filter((version): version is string => Boolean(version))
            .map((version) => Number.parseFloat(version));

        return tableVersions.filter((version) => version === this.version).length === 1;
    }

    private getVersionPattern(): RegExp {
        const escapedName = this.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`^${escapedName}_v(\\d+(?:\\.\\d+)?)$`);
    }

    private validateColumns(
        columns: string[]
    ): void {

        for (const name of columns) {

            const exists = this.columns.some(
                column => column.name === name
            );


            if (!exists) {
                throw new Error(
                    `Column "${name}" does not exist`
                );
            }
        }
    }


    // --------------------------------------------------
    // Escape Identifier
    // --------------------------------------------------

    private escape(
        identifier: string
    ): string {

        return `\`${identifier.replace(/"/g, '""')}\``;
    }


    // --------------------------------------------------
    // Format SQL Value
    // --------------------------------------------------

    private formatValue(
        value: unknown
    ): string {

        if (value === null) {
            return "NULL";
        }


        if (typeof value === "number") {
            return String(value);
        }


        if (typeof value === "boolean") {
            return value
                ? "TRUE"
                : "FALSE";
        }


        if (typeof value === "string") {

            return `'${value
                .replace(/'/g, "''")}'`;
        }


        throw new Error(
            `Unsupported default value type: ${
                typeof value
            }`
        );
    }
}