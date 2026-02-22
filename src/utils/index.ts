


export function createPageUrl(pageName: string) {
    const [path, query] = pageName.split('?');
    const lowercasePath = path.toLowerCase().replace(/ /g, '-');
    return query ? `/${lowercasePath}?${query}` : `/${lowercasePath}`;
}