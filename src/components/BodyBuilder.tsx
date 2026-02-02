import { useState } from 'react';
import type { QueryParameter } from '../types/openapi';
import './BodyBuilder.css';

interface BodyBuilderProps {
  bodyType?: string;
  onBodyTypeChange: (type: string) => void;
  selectedBodyType?: boolean;
  onBodyTypeSelect: () => void;
}

const BODY_TYPES = ['string', 'number', 'boolean', 'integer', 'array', 'object'] as const;

export default function BodyBuilder({
  bodyType = 'object',
  onBodyTypeChange,
  selectedBodyType = false,
  onBodyTypeSelect,
}: BodyBuilderProps) {
  return (
    <div className="body-builder">
      <div className="body-header">
        <h4>Body Request</h4>
      </div>

      <div className={`body-type-selector ${selectedBodyType ? 'selected' : ''}`} onClick={onBodyTypeSelect}>
        <label>Tipo Body</label>
        <select
          value={bodyType}
          onChange={(e) => onBodyTypeChange(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="body-type-select"
        >
          {BODY_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <div className="body-type-badge">{bodyType}</div>
      </div>
    </div>
  );
}
