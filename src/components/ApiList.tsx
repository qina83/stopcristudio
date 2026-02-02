import './ApiList.css';
import type { APIPath } from '../types/openapi';

interface ApiListProps {
  paths: Record<string, APIPath>;
  onApiClick: (path: string, method: string) => void;
}

interface ApiItem {
  path: string;
  method: string;
}

export default function ApiList({ paths, onApiClick }: ApiListProps) {
  // Converti paths in array e ordina alfabeticamente
  const apis: ApiItem[] = [];
  
  Object.keys(paths).forEach((path) => {
    const methods = paths[path];
    Object.keys(methods).forEach((method) => {
      apis.push({ path, method });
    });
  });

  // Ordina per path, poi per metodo
  apis.sort((a, b) => {
    if (a.path === b.path) {
      return a.method.localeCompare(b.method);
    }
    return a.path.localeCompare(b.path);
  });

  if (apis.length === 0) {
    return (
      <div className="api-list">
        <h3>API Create</h3>
        <p className="empty-message">Nessuna API creata. Aggiungi la prima!</p>
      </div>
    );
  }

  return (
    <div className="api-list">
      <h3>API Create ({apis.length})</h3>
      <div className="api-items">
        {apis.map((api, index) => (
          <div 
            key={`${api.path}-${api.method}-${index}`} 
            className="api-item"
            onClick={() => onApiClick(api.path, api.method)}
          >
            <span className={`method-badge method-${api.method.toLowerCase()}`}>
              {api.method.toUpperCase()}
            </span>
            <span className="api-path">{api.path}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
