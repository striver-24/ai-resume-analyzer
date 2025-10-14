/**
 * Handler for .well-known routes
 * This prevents errors from Chrome DevTools and other automated requests
 */
export default function WellKnown() {
    return new Response('Not Found', { status: 404 });
}

// Also export a loader to handle GET requests
export function loader() {
    return new Response('Not Found', { 
        status: 404,
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
