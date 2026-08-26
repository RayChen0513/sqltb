export const SQL_TYPE_TEXT = "TEXT";
export const SQL_TYPE_INTEGER = "INTEGER";
export const SQL_TYPE_BOOLEAN = "BOOLEAN";
export const SQL_TYPE_REAL = "REAL";

export const SQL_TYPE = {

    TEXT: SQL_TYPE_TEXT,
    INTEGER: SQL_TYPE_INTEGER,
    BOOLEAN: SQL_TYPE_BOOLEAN,
    REAL: SQL_TYPE_REAL,

    DATETIME: "DATETIME",
    TIMESTAMP: "TIMESTAMP",

    VARCHAR: (length: number) => {

        if (length <= 0) {
            throw new Error(
                "VARCHAR length must be greater than 0"
            );
        }

        return `VARCHAR(${length})`;
    },

    CHAR: (length: number) => {

        if (length <= 0) {
            throw new Error(
                "CHAR length must be greater than 0"
            );
        }

        return `CHAR(${length})`;
    },

    DECIMAL: (
        precision: number,
        scale: number
    ) => {

        if (precision <= 0) {
            throw new Error(
                "DECIMAL precision must be greater than 0"
            );
        }

        if (scale < 0 || scale > precision) {
            throw new Error(
                "DECIMAL scale must be between 0 and precision"
            );
        }

        return `DECIMAL(${precision}, ${scale})`;
    },

    ENUM: (
        values: string[] | number[]
    ) => {

        if (values.length === 0) {
            throw new Error(
                "ENUM requires at least one value"
            );
        }

        if (typeof values[0] === "number") {
            return `ENUM(${values.join(", ")})`;
        }

        if (typeof values[0] === "string") {
            return `ENUM(${values
                .map(value => `'${String(value).replace(/'/g, "")}'`)
                .join(", ")})`;
        }
        throw new Error(
                "ENUM Type error"
        );

    }

} as const;


export type SQLType = string;