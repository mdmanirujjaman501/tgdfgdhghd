import React, { useState } from 'react';
import { FileCode, Play, Copy, Check, Terminal, ExternalLink, Code2 } from 'lucide-react';
import { useToast } from '../components/common/Toast';

interface Endpoint {
  method: 'GET';
  path: string;
  description: string;
  params?: { name: string; type: string; desc: string }[];
}

export const ApiDocs: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<Record<string, string>>({});
  const [pathParam, setPathParam] = useState<string>('anupamaa');
  const [responseJson, setResponseJson] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { showToast } = useToast();

  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: '/api/v1/public/serials',
      description: 'Fetch published TV serials with pagination, category filter, and search.',
      params: [
        { name: 'page', type: 'number', desc: 'Page number (default 1)' },
        { name: 'limit', type: 'number', desc: 'Items per page (default 10)' },
        { name: 'search', type: 'string', desc: 'Search query for serial title' },
        { name: 'category_id', type: 'number', desc: 'Filter by category ID' },
      ],
    },
    {
      method: 'GET',
      path: '/api/v1/public/serials/:idOrSlug',
      description: 'Fetch detailed single TV serial with season hierarchy and cast members.',
      params: [{ name: ':idOrSlug', type: 'string', desc: 'Serial ID or URL slug (e.g., anupamaa)' }],
    },
    {
      method: 'GET',
      path: '/api/v1/public/episodes',
      description: 'Fetch episodes list with optional serial_id or season_id filter.',
      params: [
        { name: 'serial_id', type: 'number', desc: 'Filter episodes by serial ID' },
        { name: 'season_id', type: 'number', desc: 'Filter episodes by season ID' },
      ],
    },
    {
      method: 'GET',
      path: '/api/v1/public/episodes/:id',
      description: 'Fetch single episode details along with active media stream servers.',
      params: [{ name: ':id', type: 'number', desc: 'Episode ID' }],
    },
    {
      method: 'GET',
      path: '/api/v1/public/categories',
      description: 'Fetch list of all active serial categories.',
    },
    {
      method: 'GET',
      path: '/api/v1/public/actors',
      description: 'Fetch list of actors and cast profiles.',
    },
    {
      method: 'GET',
      path: '/api/v1/public/search',
      description: 'Global multi-entity search across serials, episodes, and actors.',
      params: [{ name: 'q', type: 'string', desc: 'Search keyword' }],
    },
  ];

  const currentEp = endpoints[selectedEndpoint];

  const handleTestRequest = async () => {
    setLoading(true);
    let url = currentEp.path;

    if (url.includes(':idOrSlug')) {
      url = url.replace(':idOrSlug', pathParam || 'anupamaa');
    } else if (url.includes(':id')) {
      url = url.replace(':id', pathParam || '1');
    }

    const query = new URLSearchParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v) query.append(k, String(v));
    });

    const fullUrl = query.toString() ? `${url}?${query.toString()}` : url;

    try {
      const res = await fetch(fullUrl, {
        headers: {
          'x-api-key': 'ss_live_demo_key_998877',
        },
      });
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseJson(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const generateCurl = () => {
    let url = currentEp.path;
    if (url.includes(':idOrSlug')) url = url.replace(':idOrSlug', pathParam || 'anupamaa');
    if (url.includes(':id')) url = url.replace(':id', pathParam || '1');

    return `curl -X GET "${window.location.origin}${url}" \\\n  -H "x-api-key: YOUR_API_KEY"`;
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Code snippet copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-indigo-400" />
            <span>Headless REST API Documentation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Interactive API reference, live HTTP test runner, and request payloads
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Endpoints */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Public Endpoints</h3>
          {endpoints.map((ep, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedEndpoint(idx);
                setResponseJson('');
              }}
              className={`w-full text-left p-3 rounded-xl border transition flex flex-col gap-1 ${
                selectedEndpoint === idx
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-bold">
                  {ep.method}
                </span>
                <span className="font-mono text-xs font-semibold">{ep.path}</span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{ep.description}</p>
            </button>
          ))}
        </div>

        {/* Right API Playground */}
        <div className="lg:col-span-8 space-y-5">
          {/* Endpoint Details Card */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold">
                  {currentEp.method}
                </span>
                <span className="font-mono text-sm font-semibold text-slate-100">{currentEp.path}</span>
              </div>
              <button
                onClick={handleTestRequest}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-md transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{loading ? 'Executing...' : 'Run Test Request'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-300">{currentEp.description}</p>

            {/* Path Param if applicable */}
            {(currentEp.path.includes(':idOrSlug') || currentEp.path.includes(':id')) && (
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Path Parameter ({currentEp.path.includes(':idOrSlug') ? ':idOrSlug' : ':id'}):
                </label>
                <input
                  type="text"
                  value={pathParam}
                  onChange={(e) => setPathParam(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono focus:outline-none"
                />
              </div>
            )}

            {/* cURL Snippet */}
            <div className="space-y-1.5 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">cURL Example</span>
                <button
                  onClick={() => copySnippet(generateCurl())}
                  className="text-[10px] text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy cURL</span>
                </button>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto">
                {generateCurl()}
              </pre>
            </div>
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>HTTP Response Output</span>
              </h3>
              {responseJson && (
                <button
                  onClick={() => copySnippet(responseJson)}
                  className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy JSON</span>
                </button>
              )}
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto min-h-[200px] max-h-[400px]">
              {responseJson || '// Click "Run Test Request" to see live API response payload.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
