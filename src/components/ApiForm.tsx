import { useState } from 'react';
import './ApiForm.css';

interface ApiFormProps {
  onAddApi: (path: string, method: string) => void;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function ApiForm({ onAddApi }: ApiFormProps) {
  const [path, setPath] = useState('');
  const [method, setMethod] = useState('GET');
  const [showForm, setShowForm] = useState(false);

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

    onAddApi(path, method.toLowerCase());
    
    // Reset form
    setPath('');
    setMethod('GET');
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="api-form-container">
        <button onClick={() => setShowForm(true)} className="btn-add-api">
          + Nuova API
        </button>
      </div>
    );
  }

  return (
    <div className="api-form">
      <h3>Crea Nuova API</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="method">Metodo HTTP</label>
            <select
              id="method"
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

          <div className="form-group form-group-path">
            <label htmlFor="path">Path</label>
            <input
              id="path"
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/users"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            Aggiungi
          </button>
          <button 
            type="button" 
            onClick={() => {
              setShowForm(false);
              setPath('');
              setMethod('GET');
            }}
            className="btn-cancel"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  );
}
