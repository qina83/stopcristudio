import { useState, useEffect } from 'react';
import QueryParamsBuilder from './QueryParamsBuilder';
import BodyBuilder from './BodyBuilder';
import QueryParameterEditor from './QueryParameterEditor';
import type { QueryParameter } from '../types/openapi';
import './ApiSidebar.css';

interface ApiSidebarProps {
  mode: 'create' | 'edit';
  initialPath?: string;
  initialMethod?: string;
  initialAuth?: string;
  initialParameters?: QueryParameter[];
  initialRequestBody?: QueryParameter | null;
  onSave: (path: string, method: string, auth: string, parameters: QueryParameter[], requestBody?: QueryParameter | null) => void;
  onUpdate?: (oldPath: string, oldMethod: string, newPath: string, newMethod: string, auth: string, parameters: QueryParameter[], requestBody?: QueryParameter | null) => void;
  onDelete?: (path: string, method: string) => void;
  onClose: () => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
const AUTH_TYPES = [
  { value: 'none', label: 'Nessuna autenticazione' },
  { value: 'api-key', label: 'API Key' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'oauth2', label: 'OAuth 2.0' },
];

export default function ApiSidebar({ 
  mode,
  initialPath = '', 
  initialMethod = 'GET',
  initialAuth = 'none',
  initialParameters = [],
  initialRequestBody = null,
  onSave,
  onUpdate,
  onDelete,
  onClose 
}: ApiSidebarProps) {
  const [path, setPath] = useState(initialPath);
  const [method, setMethod] = useState(initialMethod.toUpperCase());
  const [auth, setAuth] = useState(initialAuth);
  const [parameters, setParameters] = useState<QueryParameter[]>(initialParameters);
  const [requestBody, setRequestBody] = useState<QueryParameter | null>(initialRequestBody);
  const [selectedParamIndex, setSelectedParamIndex] = useState<number | null>(null);
  const [bodyExpanded, setBodyExpanded] = useState(false);

  useEffect(() => {
    setPath(initialPath);
    setMethod(initialMethod.toUpperCase());
    setAuth(initialAuth);
    setParameters(initialParameters);
    setRequestBody(initialRequestBody);
    setSelectedParamIndex(null);
  }, [initialPath, initialMethod, initialAuth, initialParameters, initialRequestBody]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!path.trim()) {
      alert('Inserisci un path per l\'API');
      return;
    }

    if (!path.startsWith('/')) {
      alert('Il path deve iniziare con /');
      return;
    }

    if (mode === 'create') {
      onSave(path, method.toLowerCase(), auth, parameters, requestBody);
      setPath('');
      setMethod('GET');
      setAuth('none');
      setParameters([]);
      setRequestBody(null);
      setSelectedParamIndex(null);
    } else if (mode === 'edit' && onUpdate) {
      onUpdate(initialPath, initialMethod, path, method.toLowerCase(), auth, parameters, requestBody);
    }
  };

  const handleDelete = () => {
    if (confirm('Sei sicuro di voler eliminare questa API?')) {
      if (onDelete) {
        onDelete(initialPath, initialMethod);
      }
    }
  };

  const handleParameterChange = (updatedParam: QueryParameter) => {
    if (selectedParamIndex === null) return;
    const updatedParams = [...parameters];
    updatedParams[selectedParamIndex] = updatedParam;
    setParameters(updatedParams);
  };

  const handleBodyChange = (updatedBody: QueryParameter) => {
    setRequestBody(updatedBody);
  };

  return (
    <div className="api-sidebar">
      <div className="sidebar-header">
        <h3>{mode === 'create' ? 'Nuova API' : 'Modifica API'}</h3>
        <button className="sidebar-close" onClick={onClose}>×</button>
      </div>
      
      <form onSubmit={handleSubmit} className="sidebar-form">
        <div className="form-three-columns">
          <div className="form-left-column">
            <div className="sidebar-form-group">
              <label htmlFor="api-method">Metodo HTTP</label>
              <select
                id="api-method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                {HTTP_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="sidebar-form-group">
              <label htmlFor="api-path">Path</label>
              <input
                id="api-path"
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/users"
                required
              />
            </div>

            <div className="sidebar-form-group">
              <label htmlFor="api-auth">Autenticazione</label>
              <select
                id="api-auth"
                value={auth}
                onChange={(e) => setAuth(e.target.value)}
              >
                {AUTH_TYPES.map((authType) => (
                  <option key={authType.value} value={authType.value}>
                    {authType.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-center-column">
            <QueryParamsBuilder 
              parameters={parameters}
              selectedParameterIndex={selectedParamIndex}
              onParametersChange={setParameters}
              onParameterSelect={setSelectedParamIndex}
            />
            {['post', 'put', 'patch'].includes(method.toLowerCase()) && (
              <BodyBuilder
                bodyType={requestBody?.type || 'object'}
                onBodyTypeChange={(newType) => {
                  const updates: Partial<QueryParameter> = { type: newType as any };
                  if (newType === 'object' && !requestBody?.objectProperties) {
                    updates.objectProperties = {};
                  } else if (newType === 'array' && !requestBody?.arrayType) {
                    updates.arrayType = 'string';
                  }
                  setRequestBody({
                    name: 'body',
                    ...(requestBody || {}),
                    ...updates,
                  });
                }}
                selectedBodyType={selectedParamIndex === null && requestBody !== null}
                onBodyTypeSelect={() => setSelectedParamIndex(null)}
              />
            )}
          </div>

          <div className="form-right-column">
            {selectedParamIndex !== null ? (
              <QueryParameterEditor
                parameter={parameters[selectedParamIndex] || null}
                onParameterChange={handleParameterChange}
              />
            ) : (
              <QueryParameterEditor
                parameter={requestBody}
                onParameterChange={handleBodyChange}
              />
            )}
          </div>
        </div>

        <div className="sidebar-actions">
          {mode === 'edit' && onDelete && (
            <button type="button" onClick={handleDelete} className="btn-delete">
              Elimina
            </button>
          )}
          <button type="submit" className="btn-primary">
            {mode === 'create' ? 'Aggiungi' : 'Salva'}
          </button>
        </div>
      </form>
    </div>
  );
}
