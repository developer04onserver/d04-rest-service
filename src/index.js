const compile = (pattern) => {
  const names = []; const escaped = pattern.split("/").map(part => {
    if (part.startsWith(":")) { names.push(part.slice(1)); return "([^/]+)"; }
    return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }).join("/");
  return { regex: new RegExp("^" + escaped + "/?$"), names };
};
export function createRouter() {
  const routes = [];
  const add = (method, path, ...handlers) => { routes.push({ method, ...compile(path), handlers }); return api; };
  const api = {
    get: (p, ...h) => add("GET", p, ...h), post: (p, ...h) => add("POST", p, ...h),
    put: (p, ...h) => add("PUT", p, ...h), patch: (p, ...h) => add("PATCH", p, ...h),
    delete: (p, ...h) => add("DELETE", p, ...h),
    async handle(req, res) {
      const url = new URL(req.url, "http://localhost");
      const route = routes.find(r => r.method === req.method && r.regex.test(url.pathname));
      if (!route) { res.writeHead(404, { "content-type": "application/json" }); return res.end(JSON.stringify({ error: "not_found" })); }
      const match = route.regex.exec(url.pathname); req.params = Object.fromEntries(route.names.map((n, i) => [n, decodeURIComponent(match[i + 1])]));
      req.query = Object.fromEntries(url.searchParams);
      let index = 0;
      const next = async (error) => {
        if (error) throw error;
        const handler = route.handlers[index++]; if (handler) await handler(req, res, next);
      };
      try { await next(); } catch (error) { if (!res.headersSent) res.writeHead(500, { "content-type": "application/json" }); if (!res.writableEnded) res.end(JSON.stringify({ error: "internal_error", message: error.message })); }
    }
  };
  return api;
}
export function json(res, status, data) { res.writeHead(status, { "content-type": "application/json; charset=utf-8" }); res.end(JSON.stringify(data)); }
export async function readJson(req, { limit = 1_000_000 } = {}) {
  let raw = ""; for await (const chunk of req) { raw += chunk; if (raw.length > limit) throw new Error("Payload too large"); }
  return raw ? JSON.parse(raw) : {};
}