export function preprocess(input: string) {
    input = correctString(input);

    return input;
}

export function correctString(input: string) {
    /**
     * Escape all strange characters
     */
    input = input.split("'").join(":single_quote:");
    input = input.split('"').join(":double_quote:");
    input = input.split("(").join(":open_bracket:");
    input = input.split(")").join(":close_bracket:");

    input = input.split(/[\u0800-\uFFFF]/g).join('');
    return input;
}