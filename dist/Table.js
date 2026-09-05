import { SQLGenerator } from "./SQLGenerator.js";
// --------------------------------------------------
// Table
// --------------------------------------------------
export class Table {
    name;
    version = 1;
    columns = [];
    primaryKey;
    indexes = [];
    foreignKeys = [];
    comment;
    constructor(name) {
        this.name = name;
        if (!name.trim()) {
            throw new Error("Table name cannot be empty");
        }
    }
    // --------------------------------------------------
    // Version
    // --------------------------------------------------
    setVersion(version) {
        if (version < 0) {
            throw new Error("Table version cannot be negative");
        }
        this.version = version;
        return this;
    }
    // --------------------------------------------------
    // Column
    // --------------------------------------------------
    addColumn(name, type, options = {}) {
        if (!name.trim()) {
            throw new Error("Column name cannot be empty");
        }
        if (this.columns.some(column => column.name === name)) {
            throw new Error(`Column "${name}" already exists`);
        }
        this.columns.push({
            name,
            type,
            options
        });
        return this;
    }
    removeColumn(name) {
        this.columns = this.columns.filter(column => column.name !== name);
        return this;
    }
    // --------------------------------------------------
    // Primary Key
    // --------------------------------------------------
    setPK(name) {
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
    addIndex(columns, name) {
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
    addUnique(columns, name) {
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
    addForeignKey(columns, referenceTable, referenceColumns, options = {}) {
        const localColumns = Array.isArray(columns)
            ? columns
            : [columns];
        const foreignColumns = Array.isArray(referenceColumns)
            ? referenceColumns
            : [referenceColumns];
        if (localColumns.length !==
            foreignColumns.length) {
            throw new Error("Foreign key column count does not match");
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
    setComment(comment) {
        this.comment = comment;
        return this;
    }
    // --------------------------------------------------
    // Build
    // --------------------------------------------------
    build() {
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
    toJSON() {
        return this.build();
    }
    // --------------------------------------------------
    // SQL
    // --------------------------------------------------
    toSQL() {
        return SQLGenerator.createTable(this.build());
    }
    // --------------------------------------------------
    // Validation
    // --------------------------------------------------
    findOldVersions(tables) {
        const tablePrefix = this.getVersionPattern();
        const tableVersions = tables
            .map((tableName) => tableName.match(tablePrefix)?.[1])
            .filter((version) => Boolean(version))
            .map((version) => Number.parseFloat(version));
        return tableVersions.filter((version) => version < this.version);
    }
    findOldTables(tables) {
        const oldTableVersions = this.findOldVersions(tables);
        return oldTableVersions.map((version) => `${this.name}_v${version.toString()}`);
    }
    isCurrentVersionEsist(tables) {
        const tablePrefix = this.getVersionPattern();
        const tableVersions = tables
            .map((tableName) => tableName.match(tablePrefix)?.[1])
            .filter((version) => Boolean(version))
            .map((version) => Number.parseFloat(version));
        return tableVersions.filter((version) => version === this.version).length === 1;
    }
    getVersionPattern() {
        const escapedName = this.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        return new RegExp(`^${escapedName}_v(\\d+(?:\\.\\d+)?)$`);
    }
    validateColumns(columns) {
        for (const name of columns) {
            const exists = this.columns.some(column => column.name === name);
            if (!exists) {
                throw new Error(`Column "${name}" does not exist`);
            }
        }
    }
    // --------------------------------------------------
    // Escape Identifier
    // --------------------------------------------------
    escape(identifier) {
        return `\`${identifier.replace(/"/g, '""')}\``;
    }
    // --------------------------------------------------
    // Format SQL Value
    // --------------------------------------------------
    formatValue(value) {
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
        throw new Error(`Unsupported default value type: ${typeof value}`);
    }
}
//# sourceMappingURL=Table.js.map