/**
 * Formats an image path into a full URL if it's a relative path.
 * In a production environment, this ensures images are prefixed with the correct domain.
 */
export function getImageUrl(path: string | null | undefined): string {
    if (!path) return "";

    // If it's already a full URL, return it
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    // If it's a root-relative path (e.g. /uploads/...), prepend the app URL or fallback to origin
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";

    // Fallback to window origin if in browser and baseUrl is empty or localhost
    if (typeof window !== "undefined" && (!baseUrl || baseUrl.includes("localhost"))) {
        baseUrl = window.location.origin;
    }

    if (path.startsWith("/")) {
        // Remove trailing slash from baseUrl if it exists
        const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        return `${formattedBaseUrl}${path}`;
    }

    return path;
}
