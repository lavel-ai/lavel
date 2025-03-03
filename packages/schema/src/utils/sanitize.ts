
export const sanitizeHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
}