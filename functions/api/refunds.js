/* ==========================================================================
   CLOUDFLARE PAGES FUNCTION - BACKEND FOR MANUAL REFUNDS
   ========================================================================== */

export async function onRequestGet(context) {
    const { request, env } = context;
    
    // Check Authorization header for password validation
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || (authHeader !== 'reembolso' && authHeader !== 'admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Fetch list from Cloudflare KV Namespace (bound to env.REFUNDS)
        const list = await env.REFUNDS.get('requests_list');
        return new Response(list || '[]', {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPost(context) {
    const { request, env } = context;

    try {
        const newRequest = await request.json();
        
        // Fetch current list from KV
        let listStr = await env.REFUNDS.get('requests_list');
        let list = [];
        if (listStr) {
            list = JSON.parse(listStr);
        }

        // Add request to the beginning
        list.unshift(newRequest);

        // Save back to KV
        await env.REFUNDS.put('requests_list', JSON.stringify(list));

        return new Response(JSON.stringify({ result: 'success', id: newRequest.id }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestPut(context) {
    const { request, env } = context;

    // Check Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || (authHeader !== 'reembolso' && authHeader !== 'admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const { id, status } = await request.json();
        
        // Fetch current list
        let listStr = await env.REFUNDS.get('requests_list');
        if (!listStr) {
            return new Response(JSON.stringify({ error: 'No requests found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let list = JSON.parse(listStr);
        const index = list.findIndex(r => r.id === id);
        
        if (index !== -1) {
            list[index].status = status;
            await env.REFUNDS.put('requests_list', JSON.stringify(list));
            return new Response(JSON.stringify({ result: 'success' }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ error: 'Request not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

export async function onRequestDelete(context) {
    const { request, env } = context;

    // Check Authorization
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || (authHeader !== 'reembolso' && authHeader !== 'admin')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Read URL query parameter for id
        const url = new URL(request.url);
        const id = url.searchParams.get('id');
        
        if (!id) {
            return new Response(JSON.stringify({ error: 'Missing id parameter' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Fetch list
        let listStr = await env.REFUNDS.get('requests_list');
        if (!listStr) {
            return new Response(JSON.stringify({ error: 'No requests found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        let list = JSON.parse(listStr);
        const filtered = list.filter(r => r.id !== id);
        
        await env.REFUNDS.put('requests_list', JSON.stringify(filtered));
        
        return new Response(JSON.stringify({ result: 'success' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
