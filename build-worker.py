import os

# Paths
base_dir = r"C:\Users\Tercio\AppData\Local\Temp" # just a safe temp script
workspace_dir = r"C:\Users\Tercio\.gemini\antigravity\scratch\reembolso-expert"

# Read files
with open(os.path.join(workspace_dir, "index.html"), "r", encoding="utf-8") as f:
    html_content = f.read()

with open(os.path.join(workspace_dir, "style.css"), "r", encoding="utf-8") as f:
    css_content = f.read()

with open(os.path.join(workspace_dir, "app.js"), "r", encoding="utf-8") as f:
    app_js_content = f.read()

with open(os.path.join(workspace_dir, "admin.html"), "r", encoding="utf-8") as f:
    admin_html_content = f.read()

with open(os.path.join(workspace_dir, "admin.js"), "r", encoding="utf-8") as f:
    admin_js_content = f.read()

# Replace local assets with GitHub raw URLs
github_raw_prefix = "https://raw.githubusercontent.com/alefecostta/reembolso-expert/main/"
html_content = html_content.replace("assets/aipro.png", github_raw_prefix + "assets/aipro.png")
html_content = html_content.replace("assets/titan.png", github_raw_prefix + "assets/titan.png")
html_content = html_content.replace("assets/vip.png", github_raw_prefix + "assets/vip.png")

# Bundle CSS and JS into index.html
# Find </head> and insert <style>
styled_html = html_content.replace("</head>", f"<style>\n{css_content}\n</style>\n</head>")
# Find <script src="app.js"></script> and replace with inline script
final_html = styled_html.replace('<script src="app.js"></script>', f"<script>\n{app_js_content}\n</script>")

# Bundle CSS and JS into admin.html
admin_styled_html = admin_html_content.replace("</head>", f"<style>\n{css_content}\n</style>\n</head>")
final_admin_html = admin_styled_html.replace('<script src="admin.js"></script>', f"<script>\n{admin_js_content}\n</script>")

# Create the Cloudflare Worker script template
worker_template = f"""/* ==========================================================================
   UNIFIED CLOUDFLARE WORKER - MANUAL REFUNDS (FRONTEND + BACKEND API)
   ========================================================================== */

const HTML_CLIENT = `{final_html.replace("`", "\\`").replace("${", "\\${")}`;
const HTML_ADMIN = `{final_admin_html.replace("`", "\\`").replace("${", "\\${")}`;

export default {{
    async fetch(request, env, ctx) {{
        const url = new URL(request.url);
        const path = url.pathname;

        // ------------------------------------------------------------------
        // 1. ROUTING: FRONTEND PAGES
        // ------------------------------------------------------------------
        if (path === "/" || path === "/index.html") {{
            return new Response(HTML_CLIENT, {{
                headers: {{ "Content-Type": "text/html; charset=utf-8" }}
            }});
        }}

        if (path === "/admin.html" || path === "/admin") {{
            return new Response(HTML_ADMIN, {{
                headers: {{ "Content-Type": "text/html; charset=utf-8" }}
            }});
        }}

        // ------------------------------------------------------------------
        // 2. ROUTING: BACKEND API ENDPOINTS
        // ------------------------------------------------------------------
        if (path === "/api/refunds") {{
            const method = request.method;

            // GET /api/refunds - Fetch all requests
            if (method === "GET") {{
                const authHeader = request.headers.get("Authorization");
                if (!authHeader || (authHeader !== "admin123" && authHeader !== "admin")) {{
                    return new Response(JSON.stringify({{ error: "Unauthorized" }}), {{
                        status: 401,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
                try {{
                    const list = await env.REFUNDS.get("requests_list");
                    return new Response(list || "[]", {{
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }} catch (err) {{
                    return new Response(JSON.stringify({{ error: err.message }}), {{
                        status: 500,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
            }}

            // POST /api/refunds - Submit new request
            if (method === "POST") {{
                try {{
                    const newRequest = await request.json();
                    
                    let listStr = await env.REFUNDS.get("requests_list");
                    let list = [];
                    if (listStr) {{
                        list = JSON.parse(listStr);
                    }}

                    list.unshift(newRequest);
                    await env.REFUNDS.put("requests_list", JSON.stringify(list));

                    return new Response(JSON.stringify({{ result: "success", id: newRequest.id }}), {{
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }} catch (err) {{
                    return new Response(JSON.stringify({{ error: err.message }}), {{
                        status: 500,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
            }}

            // PUT /api/refunds - Update request status
            if (method === "PUT") {{
                const authHeader = request.headers.get("Authorization");
                if (!authHeader || (authHeader !== "admin123" && authHeader !== "admin")) {{
                    return new Response(JSON.stringify({{ error: "Unauthorized" }}), {{
                        status: 401,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
                try {{
                    const {{ id, status }} = await request.json();
                    let listStr = await env.REFUNDS.get("requests_list");
                    if (!listStr) {{
                        return new Response(JSON.stringify({{ error: "No requests found" }}), {{
                            status: 404,
                            headers: {{ "Content-Type": "application/json" }}
                        }});
                    }}

                    let list = JSON.parse(listStr);
                    const index = list.findIndex(r => r.id === id);
                    if (index !== -1) {{
                        list[index].status = status;
                        await env.REFUNDS.put("requests_list", JSON.stringify(list));
                        return new Response(JSON.stringify({{ result: "success" }}), {{
                            headers: {{ "Content-Type": "application/json" }}
                        }});
                    }} else {{
                        return new Response(JSON.stringify({{ error: "Request not found" }}), {{
                            status: 404,
                            headers: {{ "Content-Type": "application/json" }}
                        }});
                    }}
                }} catch (err) {{
                    return new Response(JSON.stringify({{ error: err.message }}), {{
                        status: 500,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
            }}

            // DELETE /api/refunds - Delete request
            if (method === "DELETE") {{
                const authHeader = request.headers.get("Authorization");
                if (!authHeader || (authHeader !== "admin123" && authHeader !== "admin")) {{
                    return new Response(JSON.stringify({{ error: "Unauthorized" }}), {{
                        status: 401,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
                try {{
                    const id = url.searchParams.get("id");
                    if (!id) {{
                        return new Response(JSON.stringify({{ error: "Missing id parameter" }}), {{
                            status: 400,
                            headers: {{ "Content-Type": "application/json" }}
                        }});
                    }}

                    let listStr = await env.REFUNDS.get("requests_list");
                    if (!listStr) {{
                        return new Response(JSON.stringify({{ error: "No requests found" }}), {{
                            status: 404,
                            headers: {{ "Content-Type": "application/json" }}
                        }});
                    }}

                    let list = JSON.parse(listStr);
                    const filtered = list.filter(r => r.id !== id);
                    await env.REFUNDS.put("requests_list", JSON.stringify(filtered));

                    return new Response(JSON.stringify({{ result: "success" }}), {{
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }} catch (err) {{
                    return new Response(JSON.stringify({{ error: err.message }}), {{
                        status: 500,
                        headers: {{ "Content-Type": "application/json" }}
                    }});
                }}
            }}
        }}

        // Fallback: 404
        return new Response("Not Found", {{ status: 404 }});
    }}
}};
"""

# Write outputs
with open(os.path.join(workspace_dir, "cloudflare-worker.js"), "w", encoding="utf-8") as f:
    f.write(worker_template)

print("cloudflare-worker.js successfully built!")
