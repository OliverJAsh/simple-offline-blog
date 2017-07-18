export const getContentUrl = (contentId) => `/api/${contentId}`;

export const isClient = typeof window !== 'undefined';

export const isContentCached = (contentId) =>
    isClient
        ? caches.open('content').then((cache) =>
            cache.match(getContentUrl(contentId))
                .then(response => !! response)
        )
        : Promise.resolve(false);
