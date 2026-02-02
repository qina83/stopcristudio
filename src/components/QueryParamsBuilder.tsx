import { useState } from 'react';
import type { QueryParameter } from '../types/openapi';
import './QueryParamsBuilder.css';

interface QueryParamsBuilderProps {
  parameters: QueryParameter[];
  selectedParameterIndex: number | null;
  onParametersChange: (parameters: QueryParameter[]) => void;
  onParameterSelect: (index: number | null) => void;
}

export default function QueryParamsBuilder({
  parameters,
  selectedParameterIndex,
  onParametersChange,
  onParameterSelect,
}: QueryParamsBuilderProps) {
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');

  const addParameter = () => {
    const newParam: QueryParameter = {
      name: `param_${Date.now()}`,
      type: 'string',
      required: false,
      description: '',
    };
    const newParams = [...parameters, newParam];
    onParametersChange(newParams);
    onParameterSelect(newParams.length - 1);
  };

  const removeParameter = (index: number) => {
    const newParams = parameters.filter((_, i) => i !== index);
    onParametersChange(newParams);
    if (selectedParameterIndex === index) {
      onParameterSelect(newParams.length > 0 ? 0 : null);
    } else if (selectedParameterIndex !== null && selectedParameterIndex > index) {
      onParameterSelect(selectedParameterIndex - 1);
    }
  };

  const startEditingName = (index: number) => {
    setEditingNameIndex(index);
    setEditingName(parameters[index].name);
  };

  const finishEditingName = (index: number) => {
    if (editingName.trim() && editingName !== parameters[index].name) {
      const updatedParams = [...parameters];
      updatedParams[index] = { ...updatedParams[index], name: editingName };
      onParametersChange(updatedParams);
    }
    setEditingNameIndex(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      finishEditingName(index);
    } else if (e.key === 'Escape') {
      setEditingNameIndex(null);
    }
  };

  return (
    <div className="query-params-builder">
      <div className="params-header">
        <h4>Parametri Query String</h4>
        <button
          type="button"
          onClick={addParameter}
          className="btn-add-param"
          title="Aggiungi parametro"
        >
          + Parametro
        </button>
      </div>

      {parameters.length === 0 && (
        <div className="params-empty">
          <p>Nessun parametro. Clicca "+ Parametro" per aggiungerne uno.</p>
        </div>
      )}

      <div className="params-list">
        {parameters.map((param, index) => (
          <div
            key={index}
            className={`param-item ${selectedParameterIndex === index ? 'selected' : ''}`}
            onClick={() => onParameterSelect(index)}
          >
            <div className="param-content">
              <div className="param-summary">
                {editingNameIndex === index ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => finishEditingName(index)}
                    onKeyDown={(e) => handleKeyPress(e, index)}
                    onClick={(e) => e.stopPropagation()}
                    className="param-name-input"
                  />
                ) : (
                  <span
                    className="param-name"
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      startEditingName(index);
                    }}
                    title="Doppio-click per modificare il nome"
                  >
                    {param.name}
                  </span>
                )}
                <span className={`param-type type-${param.type}`}>{param.type}</span>
                {param.required && <span className="param-required">*</span>}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeParameter(index);
              }}
              className="btn-remove-param"
              title="Rimuovi parametro"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

