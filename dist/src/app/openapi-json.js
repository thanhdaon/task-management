export const jsonContent = (schema, description = "") => {
    return {
        content: {
            "application/json": {
                schema,
            },
        },
        description,
    };
};
export const jsonContentRequired = (schema, description = "") => {
    return {
        ...jsonContent(schema, description),
        required: true,
    };
};
