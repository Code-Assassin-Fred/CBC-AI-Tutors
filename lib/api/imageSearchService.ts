/**
 * Image Search Service
 * 
 * Interfaced with Google Custom Search API and other providers 
 * to find real-world images for textbook content.
 */

export interface SearchResult {
    title: string;
    link: string;
    snippet: string;
    thumbnailUrl?: string;
    mime?: string;
}

const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY || process.env.GEMINI_IMAGE_API_KEY || process.env.GOOGLE_API_KEY;
const CX = process.env.GOOGLE_CSE_CX;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

/**
 * Search for images using Wikimedia Commons (Keyless Fallback)
 */
async function searchWikimediaImages(query: string, count: number): Promise<SearchResult[]> {
    try {
        // Wikimedia API search for files
        const url = new URL("https://commons.wikimedia.org/w/api.php");
        url.searchParams.append("action", "query");
        url.searchParams.append("format", "json");
        url.searchParams.append("list", "search");
        url.searchParams.append("srsearch", `${query} filetype:bitmap`); // bitmap avoids some svg issues
        url.searchParams.append("srnamespace", "6"); // File namespace
        url.searchParams.append("srlimit", count.toString());
        url.searchParams.append("origin", "*");

        const response = await fetch(url.toString());
        if (!response.ok) throw new Error(`Wikimedia API error ${response.status}`);

        const data = await response.json();
        const searchResults = data.query?.search || [];

        const results: SearchResult[] = [];

        for (const item of searchResults) {
            // Get actual file URL and thumbnail
            const title = item.title;
            const infoUrl = new URL("https://commons.wikimedia.org/w/api.php");
            infoUrl.searchParams.append("action", "query");
            infoUrl.searchParams.append("format", "json");
            infoUrl.searchParams.append("prop", "imageinfo");
            infoUrl.searchParams.append("titles", title);
            infoUrl.searchParams.append("iiprop", "url|extmetadata");
            infoUrl.searchParams.append("iiurlwidth", "800");
            infoUrl.searchParams.append("origin", "*");

            const infoRes = await fetch(infoUrl.toString());
            const infoData = await infoRes.json();
            const pages = infoData.query?.pages || {};
            const page = Object.values(pages)[0] as any;
            const info = page?.imageinfo?.[0];

            if (info) {
                results.push({
                    title: title.replace("File:", "").replace(/\..+$/, ""),
                    link: info.url,
                    snippet: info.extmetadata?.ObjectName?.value || "Educational image from Wikimedia Commons",
                    thumbnailUrl: info.thumburl,
                    mime: "image/jpeg"
                });
            }
        }

        return results;
    } catch (error: any) {
        console.error("[SearchService] Wikimedia Search Error:", error.message);
        return [];
    }
}

/**
 * Main entry point for image search with fallback logic
 */
export async function searchImages(query: string, count: number = 3): Promise<SearchResult[]> {
    console.log(`[SearchService] Searching for: "${query}" (count: ${count})`);

    // Provider 1: Google Custom Search (Primary)
    if (GOOGLE_API_KEY && CX) {
        try {
            const results = await searchGoogleImages(query, count);
            if (results && results.length > 0) {
                console.log(`[SearchService] Google Search succeeded for "${query}"`);
                return results;
            }
        } catch (error: any) {
            console.error("[SearchService] Google Search Error:", error.message);
            // Continue to next provider if it's a permission or quota issue
        }
    } else {
        console.warn("[SearchService] Google credentials missing.");
    }

    // Provider 2: Unsplash (Fallback)
    if (UNSPLASH_ACCESS_KEY) {
        try {
            console.log("[SearchService] Attempting Unsplash fallback...");
            const results = await searchUnsplashImages(query, count);
            if (results && results.length > 0) {
                console.log(`[SearchService] Unsplash Search succeeded for "${query}"`);
                return results;
            }
        } catch (error: any) {
            console.error("[SearchService] Unsplash Search Error:", error.message);
        }
    }

    // Provider 3: Wikimedia Commons (Keyless Fallback)
    try {
        console.log("[SearchService] Attempting Wikimedia fallback...");
        const results = await searchWikimediaImages(query, count);
        if (results && results.length > 0) {
            console.log(`[SearchService] Wikimedia Search succeeded for "${query}"`);
            return results;
        }
    } catch (error: any) {
        console.error("[SearchService] Wikimedia Search Error:", error.message);
    }

    console.warn("[SearchService] All image search providers failed or returned no results.");
    return [];
}

/**
 * Search for images using Google Custom Search
 */
async function searchGoogleImages(query: string, count: number): Promise<SearchResult[]> {
    if (!GOOGLE_API_KEY || !CX) return [];

    const url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.append("key", GOOGLE_API_KEY);
    url.searchParams.append("cx", CX);
    url.searchParams.append("q", query);
    url.searchParams.append("searchType", "image");
    url.searchParams.append("num", count.toString());
    url.searchParams.append("safe", "active");

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        let message = `Google Search API error ${response.status}`;
        try {
            const errorJson = JSON.parse(errorText);
            message = errorJson.error?.message || message;

            // Helpful specialized error messaging
            if (response.status === 403 && message.includes("access to Custom Search JSON API")) {
                message = "API Key not authorized for Custom Search. Check Google Cloud Console permissions.";
            }
        } catch { }
        throw new Error(message);
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
}

/**
 * Search for images using Unsplash API
 */
async function searchUnsplashImages(query: string, count: number): Promise<SearchResult[]> {
    if (!UNSPLASH_ACCESS_KEY) return [];

    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.append("query", query);
    url.searchParams.append("per_page", count.toString());
    url.searchParams.append("orientation", "landscape");

    const response = await fetch(url.toString(), {
        headers: {
            "Authorization": `Client-ID ${UNSPLASH_ACCESS_KEY}`
        }
    });

    if (!response.ok) {
        throw new Error(`Unsplash API error ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    return results.map((item: any) => ({
        title: item.description || item.alt_description || "Unsplash Image",
        link: item.urls.regular,
        snippet: `Photo by ${item.user.name} on Unsplash`,
        thumbnailUrl: item.urls.thumb,
        mime: "image/jpeg"
    }));
}
