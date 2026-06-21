const VERSION_KEY = 'mermaid-versions';
const MAX_VERSIONS = 10;

export interface DiagramVersion {
    code: string;
    title: string;
    timestamp: number;
}

function getStorageKey(diagramId: string) {
    return `${VERSION_KEY}:${diagramId}`;
}

export function getVersions(diagramId: string): DiagramVersion[] {
    try {
        const raw = localStorage.getItem(getStorageKey(diagramId));
        if (!raw) return [];
        return JSON.parse(raw) as DiagramVersion[];
    } catch {
        return [];
    }
}

export function saveVersion(diagramId: string, code: string, title: string) {
    try {
        const versions = getVersions(diagramId);
        versions.push({ code, title, timestamp: Date.now() });
        if (versions.length > MAX_VERSIONS) {
            versions.splice(0, versions.length - MAX_VERSIONS);
        }
        localStorage.setItem(getStorageKey(diagramId), JSON.stringify(versions));
    } catch {
        // localStorage full or unavailable
    }
}

export function clearVersions(diagramId: string) {
    try {
        localStorage.removeItem(getStorageKey(diagramId));
    } catch {
        // ignore
    }
}
