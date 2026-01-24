/**
 * Image Search Service
 * 
 * Interfaced with Google Custom Search API to find real-world images
 * for textbook content.
 */

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    thumbnailUrl?: string;
    mime?: string;
}

const GOOGLE_API_KEY = process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CSE_CX;

/**
 * Search for images using Google Custom Search
 */
export async function searchImages(query: string, count: number = 3): Promise<SearchResult[]> {
    if (!GOOGLE_API_KEY || !CX) {
        console.error("[SearchService] Missing API Key or CX ID");
        return [];
    }

    try {
        console.log(`[SearchService] Searching for: "${query}" (count: ${count})`);

        // Search type 'image' filters for image results
        const url = new URL("https://www.googleapis.com/customsearch/v1");
        url.searchParams.append("key", GOOGLE_API_KEY);
        url.searchParams.append("cx", CX);
        url.searchParams.append("q", query);
        url.searchParams.append("searchType", "image");
        url.searchParams.append("num", count.toString());
        url.searchParams.append("safe", "active"); // Ensure educational appropriateness

        const response = await fetch(url.toString());

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google Search API error: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        const items = data.items || [];

        return items.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
            thumbnailUrl: item.image?.thumbnailLink,
            mime: item.mime
        }));

    } catch (error) {
        console.error("[SearchService] Error searching images:", error);
        return [];
    }
}
