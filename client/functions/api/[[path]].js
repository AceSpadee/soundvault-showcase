export async function onRequest(context) {
    return context.env.SOUNDVAULT_API.fetch(context.request);
}