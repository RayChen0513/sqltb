export class SQLGenerator {
    static createTable(table) {
        const definitions = [];
        // Columns
        for (const column of table.columns) {
            let sql = `${this.escape(column.name)} ${column.type}`;
            const options = column.options;
            if (options.ALLOW_NULL === false) {
                sql += " NOT NULL";
            }
            if (options.UNIQUE === true) {
                sql += " UNIQUE";
            }
            if (options.DEFAULT === true &&
                options.DEFAULT_VALUE !== undefined) {
                if (typeof options.DEFAULT_VALUE === "string") {
                    sql += ` DEFAULT '${this.formatValue(options.DEFAULT_VALUE)}'`;
                }
                else {
                    sql += ` DEFAULT ${options.DEFAULT_VALUE.RAW}`;
                }
            }
            if (options.AUTO_INCREMENT === true) {
                sql += " AUTO_INCREMENT";
            }
            if (options.ONUPDATE) {
                if (typeof options.ONUPDATE === "string") {
                    sql += ` ONUPDATE '${this.formatValue(options.ONUPDATE)}'`;
                }
                else {
                    sql += ` ONUPDATE ${options.ONUPDATE.RAW}`;
                }
            }
            definitions.push(sql);
        }
        // Primary Key
        if (table.primaryKey) {
            definitions.push(`PRIMARY KEY (${table.primaryKey
                .map(column => this.escape(column))
                .join(", ")})`);
        }
        // Foreign Keys
        for (const key of table.foreignKeys) {
            definitions.push(this.foreignKey(key));
        }
        const tableName = this.escape(`${table.name}_V${table.version}`);
        return [
            `CREATE TABLE ${tableName} (`,
            definitions
                .map(definition => `    ${definition}`)
                .join(",\n"),
            ");"
        ].join("\n");
    }
    static foreignKey(key) {
        let sql = `FOREIGN KEY (` +
            key.columns
                .map((column) => this.escape(column))
                .join(", ") +
            `) REFERENCES ` +
            `${this.escape(key.referenceTable)} (` +
            key.referenceColumns
                .map((column) => this.escape(column))
                .join(", ") +
            `)`;
        if (key.onDelete) {
            sql += ` ON DELETE ${key.onDelete}`;
        }
        if (key.onUpdate) {
            sql += ` ON UPDATE ${key.onUpdate}`;
        }
        return sql;
    }
    static escape(identifier) {
        return `\`${identifier.replace(/`/g, "``")}\``;
    }
    static formatValue(value) {
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
//# sourceMappingURL=SQLGenerator.js.map