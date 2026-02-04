import mermaid from 'mermaid';

// Initialize mermaid once
if (typeof window !== 'undefined') {
    mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'strict',
        fontFamily: 'Space Grotesk, system-ui, sans-serif',
    });
}

export const renderMermaid = async (code: string) => {
    try {
        // Generate a random ID for each render to avoid conflicts
        const id = `mermaid-${Math.random().toString(36).substring(2, 11)}`;

        // Ensure code is not empty and is valid
        if (!code.trim()) {
            return { svg: null, error: null };
        }

        const { svg } = await mermaid.render(id, code);
        return { svg, error: null };
    } catch (error) {
        // If it's a parse error, it might be an actual mermaid error
        // Some errors are strings, others are Error objects
        const errorMessage = error instanceof Error ? error.message : String(error);
        return { svg: null, error: errorMessage };
    }
};
