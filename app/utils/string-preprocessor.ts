export function preprocess(input: string) {
    input = correctString(input);

    return input;
}

export function correctString(input: string) {
    /**
     * Escape all strange characters
     */
    input = input.split("'").join("''");
    input = input.split('"').join('""');
    input = input.split('\\').join('\\\\');
    return input;
}