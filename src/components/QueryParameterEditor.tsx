import { useState } from 'react';
import type { QueryParameter, ParameterType } from '../types/openapi';
import './QueryParameterEditor.css';

interface QueryParameterEditorProps {
  parameter: QueryParameter | null;
  onParameterChange: (parameter: QueryParameter) => void;
}

const PRIMITIVE_TYPES: ParameterType[] = ['string', 'number', 'boolean', 'integer'];
const ALL_TYPES = ['string', 'number', 'boolean', 'integer', 'array', 'object'] as const;

export default function QueryParameterEditor({
  parameter,
  onParameterChange,
}: QueryParameterEditorProps) {
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());

  if (!parameter) {
    return (
      <div className="query-parameter-editor empty">
        <p>Seleziona un parametro per modificarlo</p>
      </div>
    );
  }

  const togglePropertyExpanded = (propPath: string) => {
    const newExpanded = new Set(expandedProperties);
    if (newExpanded.has(propPath)) {
      newExpanded.delete(propPath);
    } else {
      newExpanded.add(propPath);
    }
    setExpandedProperties(newExpanded);
  };

  const handleArrayTypeChange = (newType: ParameterType) => {
    onParameterChange({
      ...parameter,
      arrayType: newType,
    });
  };

  const addObjectProperty = () => {
    const newProperty: QueryParameter = {
      name: `prop_${Date.now()}`,
      type: 'string',
      required: false,
      description: '',
    };

    const updatedObjectProps = {
      ...parameter.objectProperties,
      [newProperty.name]: newProperty,
    };

    onParameterChange({
      ...parameter,
      objectProperties: updatedObjectProps,
    });
  };

  const removeObjectProperty = (propName: string) => {
    if (!parameter.objectProperties) return;

    const updatedObjectProps = { ...parameter.objectProperties };
    delete updatedObjectProps[propName];

    onParameterChange({
      ...parameter,
      objectProperties: updatedObjectProps,
    });
  };

  const updateObjectProperty = (propName: string, updates: Partial<QueryParameter>) => {
    if (!parameter.objectProperties || !parameter.objectProperties[propName]) return;

    const updatedObjectProps = {
      ...parameter.objectProperties,
      [propName]: {
        ...parameter.objectProperties[propName],
        ...updates,
      },
    };

    onParameterChange({
      ...parameter,
      objectProperties: updatedObjectProps,
    });
  };

  const renameObjectProperty = (oldName: string, newName: string) => {
    if (!parameter.objectProperties || !parameter.objectProperties[oldName]) return;

    const oldProp = parameter.objectProperties[oldName];
    const updatedObjectProps = { ...parameter.objectProperties };
    delete updatedObjectProps[oldName];
    updatedObjectProps[newName] = oldProp;

    onParameterChange({
      ...parameter,
      objectProperties: updatedObjectProps,
    });
  };

  // Funzione ricorsiva per renderizzare proprietà a profondità arbitraria
  const renderNestedProperty = (
    propName: string,
    propValue: QueryParameter,
    itemPath: string,
    updateCallback: (updates: Partial<QueryParameter>) => void,
    renameCallback: (oldName: string, newName: string) => void,
    deleteCallback: () => void
  ): JSX.Element => {
    const isExpanded = expandedProperties.has(itemPath);
    const isComplex = propValue.type === 'object' || propValue.type === 'array';

    const handleAddObjectProperty = () => {
      const newProp: QueryParameter = {
        name: `prop_${Date.now()}`,
        type: 'string',
        required: false,
      };
      const updatedNested = {
        ...(propValue.objectProperties || {}),
        [newProp.name]: newProp,
      };
      updateCallback({ objectProperties: updatedNested });
    };

    const handleAddArrayProperty = () => {
      const newProp: QueryParameter = {
        name: `item_${Date.now()}`,
        type: 'string',
        required: false,
      };
      const updatedNested = {
        ...(propValue.arrayObjectProperties || {}),
        [newProp.name]: newProp,
      };
      updateCallback({ arrayObjectProperties: updatedNested });
    };

    return (
      <div key={itemPath} className={`nested-property-item depth-${itemPath.split('.').length}`}>
        <div className="nested-prop-header">
          {isComplex && (
            <button
              type="button"
              className={`btn-expand-nested ${isExpanded ? 'expanded' : ''}`}
              onClick={() => togglePropertyExpanded(itemPath)}
              title={isExpanded ? 'Comprimi' : 'Espandi'}
            >
              ▶
            </button>
          )}
          <input
            type="text"
            value={propName}
            onChange={(e) => renameCallback(propName, e.target.value)}
            className="nested-prop-name-input"
            placeholder="Nome"
          />
          <select
            value={propValue.type}
            onChange={(e) => {
              const newType = e.target.value as ParameterType | 'array' | 'object';
              const updates: Partial<QueryParameter> = { type: newType as any };
              if (newType === 'object' && !propValue.objectProperties) {
                updates.objectProperties = {};
              } else if (newType === 'array' && !propValue.arrayType) {
                updates.arrayType = 'string';
              }
              updateCallback(updates);
            }}
            className="nested-prop-type-select"
          >
            {PRIMITIVE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
            <option value="array">array</option>
            <option value="object">object</option>
          </select>
          <button
            type="button"
            className="btn-delete-nested"
            onClick={deleteCallback}
          >
            ✕
          </button>
        </div>

        {isExpanded && isComplex && (
          <div className="nested-editor-content">
            {propValue.type === 'object' && (
              <div className="nested-object-section">
                <div className="nested-section-header">
                  <h6>Proprietà di "{propName}"</h6>
                  <button
                    type="button"
                    className="btn-add-nested-prop-small"
                    onClick={handleAddObjectProperty}
                  >
                    + Proprietà
                  </button>
                </div>
                {!propValue.objectProperties || Object.keys(propValue.objectProperties).length === 0 ? (
                  <p className="nested-empty-msg">Nessuna proprietà</p>
                ) : (
                  <div className="nested-props-container">
                    {Object.entries(propValue.objectProperties).map(([childName, childProp]) => {
                      const childPath = `${itemPath}.obj.${childName}`;
                      return renderNestedProperty(
                        childName,
                        childProp,
                        childPath,
                        (updates) => {
                          const updated = {
                            ...propValue.objectProperties,
                            [childName]: { ...childProp, ...updates },
                          };
                          updateCallback({ objectProperties: updated });
                        },
                        (oldName, newName) => {
                          if (oldName === newName) return;
                          const updated = { ...propValue.objectProperties };
                          updated[newName] = updated[oldName];
                          delete updated[oldName];
                          updateCallback({ objectProperties: updated });
                        },
                        () => {
                          const updated = { ...propValue.objectProperties };
                          delete updated[childName];
                          updateCallback({ objectProperties: updated });
                        }
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {propValue.type === 'array' && (
              <div className="nested-array-section">
                <div className="nested-section-header">
                  <label>Tipo elementi array</label>
                  <select
                    value={propValue.arrayType || 'string'}
                    onChange={(e) => {
                      const newType = e.target.value as ParameterType | 'array' | 'object';
                      const updates: Partial<QueryParameter> = { arrayType: newType };
                      if (newType === 'object' && !propValue.arrayObjectProperties) {
                        updates.arrayObjectProperties = {};
                      }
                      updateCallback(updates);
                    }}
                    className="array-type-nested-select"
                  >
                    {PRIMITIVE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="array">array</option>
                    <option value="object">object</option>
                  </select>
                </div>

                {propValue.arrayType === 'object' && (
                  <div className="nested-array-object-section">
                    <div className="nested-section-header">
                      <h6>Proprietà elementi</h6>
                      <button
                        type="button"
                        className="btn-add-nested-prop-small"
                        onClick={handleAddArrayProperty}
                      >
                        + Proprietà
                      </button>
                    </div>
                    {!propValue.arrayObjectProperties || Object.keys(propValue.arrayObjectProperties).length === 0 ? (
                      <p className="nested-empty-msg">Nessuna proprietà</p>
                    ) : (
                      <div className="nested-props-container">
                        {Object.entries(propValue.arrayObjectProperties).map(([childName, childProp]) => {
                          const childPath = `${itemPath}.arr.${childName}`;
                          return renderNestedProperty(
                            childName,
                            childProp,
                            childPath,
                            (updates) => {
                              const updated = {
                                ...propValue.arrayObjectProperties,
                                [childName]: { ...childProp, ...updates },
                              };
                              updateCallback({ arrayObjectProperties: updated });
                            },
                            (oldName, newName) => {
                              if (oldName === newName) return;
                              const updated = { ...propValue.arrayObjectProperties };
                              updated[newName] = updated[oldName];
                              delete updated[oldName];
                              updateCallback({ arrayObjectProperties: updated });
                            },
                            () => {
                              const updated = { ...propValue.arrayObjectProperties };
                              delete updated[childName];
                              updateCallback({ arrayObjectProperties: updated });
                            }
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPropertyItem = (propName: string, propValue: QueryParameter, parentPath: string) => {
    const itemPath = `${parentPath}.${propName}`;
    const isExpanded = expandedProperties.has(itemPath);
    const isComplexType = propValue.type === 'object' || propValue.type === 'array';

    return (
      <div key={propName} className="property-item">
        <div className="property-header">
          {isComplexType && (
            <button
              type="button"
              className={`expand-btn ${isExpanded ? 'expanded' : ''}`}
              onClick={() => togglePropertyExpanded(itemPath)}
              title={isExpanded ? 'Comprimi' : 'Espandi'}
            >
              ▶
            </button>
          )}
          <input
            type="text"
            value={propName}
            onChange={(e) => {
              const newPropName = e.target.value;
              const props = parameter.objectProperties || {};
              const oldProp = props[propName];
              const updatedProps = { ...props };
              delete updatedProps[propName];
              updatedProps[newPropName] = oldProp;
              onParameterChange({
                ...parameter,
                objectProperties: updatedProps,
              });
            }}
            placeholder="Nome proprietà"
            className="prop-name-input"
          />
          <select
            value={propValue.type}
            onChange={(e) =>
              updateObjectProperty(propName, {
                type: e.target.value as ParameterType | 'array' | 'object' as any,
                ...(e.target.value === 'object' ? { objectProperties: {} } : {}),
                ...(e.target.value === 'array' ? { arrayType: 'string' } : {}),
              })
            }
            className="prop-type-select"
          >
            <optgroup label="Tipi Primitivi">
              {PRIMITIVE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </optgroup>
            <optgroup label="Tipi Complessi">
              <option value="array">array</option>
              <option value="object">object</option>
            </optgroup>
          </select>
          <button
            type="button"
            onClick={() => removeObjectProperty(propName)}
            className="btn-remove-prop"
          >
            ✕
          </button>
        </div>

        {isExpanded && propValue.type === 'object' && propValue.objectProperties && (
          <div className="nested-object-editor">
            <div className="nested-header">
              <h6>Proprietà di "{propName}"</h6>
              <button
                type="button"
                onClick={() => {
                  const newProperty: QueryParameter = {
                    name: `nested_prop_${Date.now()}`,
                    type: 'string',
                    required: false,
                  };
                  const updatedNestedProps = {
                    ...propValue.objectProperties,
                    [newProperty.name]: newProperty,
                  };
                  updateObjectProperty(propName, {
                    objectProperties: updatedNestedProps,
                  });
                }}
                className="btn-add-nested-prop"
              >
                + Proprietà
              </button>
            </div>
            <div className="nested-properties">
              {Object.keys(propValue.objectProperties).length === 0 ? (
                <p className="nested-empty">Nessuna proprietà. Clicca "+ Proprietà" per aggiungerne.</p>
              ) : (
                Object.entries(propValue.objectProperties).map(([nestedPropName, nestedPropValue]) => {
                  // Renderizza ricorsivamente le proprietà annidate
                  return (
                    <div key={nestedPropName} className="nested-property-item">
                      <div className="nested-prop-header">
                        <input
                          type="text"
                          value={nestedPropName}
                          onChange={(e) => {
                            const newName = e.target.value;
                            const oldProps = propValue.objectProperties || {};
                            const newProps = { ...oldProps };
                            const oldProp = newProps[nestedPropName];
                            delete newProps[nestedPropName];
                            newProps[newName] = oldProp;
                            updateObjectProperty(propName, {
                              objectProperties: newProps,
                            });
                          }}
                          placeholder="Nome proprietà"
                          className="nested-prop-name"
                        />
                        <select
                          value={nestedPropValue.type}
                          onChange={(e) => {
                            const newType = e.target.value as ParameterType | 'array' | 'object' as any;
                            const updatedNestedProps = { ...propValue.objectProperties };
                            updatedNestedProps[nestedPropName] = {
                              ...updatedNestedProps[nestedPropName],
                              type: newType,
                              ...(newType === 'object' ? { objectProperties: {} } : {}),
                              ...(newType === 'array' ? { arrayType: 'string' } : {}),
                            };
                            updateObjectProperty(propName, {
                              objectProperties: updatedNestedProps,
                            });
                          }}
                          className="nested-prop-type"
                        >
                          <optgroup label="Tipi Primitivi">
                            {PRIMITIVE_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Tipi Complessi">
                            <option value="array">array</option>
                            <option value="object">object</option>
                          </optgroup>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedNestedProps = { ...propValue.objectProperties };
                            delete updatedNestedProps[nestedPropName];
                            updateObjectProperty(propName, {
                              objectProperties: updatedNestedProps,
                            });
                          }}
                          className="btn-remove-nested-prop"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {isExpanded && propValue.type === 'array' && (
          <div className="nested-array-editor">
            <div className="nested-header">
              <label>Tipo elementi di "{propName}"</label>
              <select
                value={propValue.arrayType || 'string'}
                onChange={(e) => {
                  const newType = e.target.value as ParameterType | 'array' | 'object' as any;
                  updateObjectProperty(propName, {
                    arrayType: newType,
                    ...(newType === 'object' ? { arrayObjectProperties: {} } : {}),
                  });
                }}
                className="nested-array-type"
              >
                <optgroup label="Tipi Primitivi">
                  {PRIMITIVE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Tipi Complessi">
                  <option value="array">array</option>
                  <option value="object">object</option>
                </optgroup>
              </select>
            </div>
            {propValue.arrayType === 'object' && propValue.arrayObjectProperties && (
              <div className="nested-array-object-props">
                <div className="nested-header">
                  <h6>Proprietà elementi Array</h6>
                  <button
                    type="button"
                    onClick={() => {
                      const newProperty: QueryParameter = {
                        name: `array_item_prop_${Date.now()}`,
                        type: 'string',
                      };
                      const updatedProps = {
                        ...propValue.arrayObjectProperties,
                        [newProperty.name]: newProperty,
                      };
                      updateObjectProperty(propName, {
                        arrayObjectProperties: updatedProps,
                      });
                    }}
                    className="btn-add-nested-prop"
                  >
                    + Proprietà
                  </button>
                </div>
                {Object.keys(propValue.arrayObjectProperties).length === 0 ? (
                  <p className="nested-empty">Nessuna proprietà configurata</p>
                ) : (
                  <div className="nested-properties">
                    {Object.entries(propValue.arrayObjectProperties).map(([itemPropName, itemPropValue]) => (
                      <div key={itemPropName} className="nested-property-item">
                        <div className="nested-prop-header">
                          <input
                            type="text"
                            value={itemPropName}
                            onChange={(e) => {
                              const newName = e.target.value;
                              const oldProps = propValue.arrayObjectProperties || {};
                              const newProps = { ...oldProps };
                              const oldProp = newProps[itemPropName];
                              delete newProps[itemPropName];
                              newProps[newName] = oldProp;
                              updateObjectProperty(propName, {
                                arrayObjectProperties: newProps,
                              });
                            }}
                            placeholder="Nome proprietà"
                            className="nested-prop-name"
                          />
                          <select
                            value={itemPropValue.type}
                            onChange={(e) => {
                              const newType = e.target.value as ParameterType | 'array' | 'object' as any;
                              const updatedProps = { ...propValue.arrayObjectProperties };
                              updatedProps[itemPropName] = {
                                ...updatedProps[itemPropName],
                                type: newType,
                              };
                              updateObjectProperty(propName, {
                                arrayObjectProperties: updatedProps,
                              });
                            }}
                            className="nested-prop-type"
                          >
                            <optgroup label="Tipi Primitivi">
                              {PRIMITIVE_TYPES.map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </optgroup>
                            <optgroup label="Tipi Complessi">
                              <option value="array">array</option>
                              <option value="object">object</option>
                            </optgroup>
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedProps = { ...propValue.arrayObjectProperties };
                              delete updatedProps[itemPropName];
                              updateObjectProperty(propName, {
                                arrayObjectProperties: updatedProps,
                              });
                            }}
                            className="btn-remove-nested-prop"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="query-parameter-editor">
      <div className="editor-header">
        <h4>Modifica Parametro</h4>
        <p className="editor-param-name">{parameter.name}</p>
      </div>

      <div className="editor-content">
        <div className="form-group">
          <label>Tipo</label>
          <select
            value={parameter.type}
            onChange={(e) => {
              const newType = e.target.value as typeof parameter.type;
              const updates: Partial<QueryParameter> = { type: newType };
              if (newType === 'array') {
                updates.arrayType = 'string';
              }
              if (newType === 'object') {
                updates.objectProperties = {};
              }
              onParameterChange({ ...parameter, ...updates });
            }}
          >
            <option value="string">string</option>
            <option value="number">number</option>
            <option value="boolean">boolean</option>
            <option value="integer">integer</option>
            <option value="array">array</option>
            <option value="object">object</option>
          </select>
        </div>

        {parameter.type === 'array' && (
          <div className="form-group">
            <label>Tipo Elementi Array</label>
            <select
              value={parameter.arrayType || 'string'}
              onChange={(e) => {
                const newType = e.target.value as ParameterType | 'array' | 'object';
                const updates: Partial<QueryParameter> = { arrayType: newType as ParameterType };
                // Se cambio il tipo a array o object, inizializzo le rispettive proprietà
                if (newType === 'array' && !parameter.arrayItemStructure) {
                  // Potresti aggiungere arrayItemStructure se necessario
                } else if (newType === 'object' && !parameter.arrayObjectProperties) {
                  updates.arrayObjectProperties = {};
                }
                onParameterChange({ ...parameter, ...updates });
              }}
            >
              <optgroup label="Tipi Primitivi">
                {PRIMITIVE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Tipi Complessi">
                <option value="array">array</option>
                <option value="object">object</option>
              </optgroup>
            </select>
          </div>
        )}

        {parameter.type === 'array' && parameter.arrayType === 'object' && (
          <div className="nested-object">
            <div className="nested-object-header">
              <h5>Proprietà elementi Array</h5>
              <button
                type="button"
                onClick={() => {
                  const newProperty: QueryParameter = {
                    name: `item_prop_${Date.now()}`,
                    type: 'string',
                    required: false,
                  };
                  const updatedProps = {
                    ...parameter.arrayObjectProperties,
                    [newProperty.name]: newProperty,
                  };
                  onParameterChange({
                    ...parameter,
                    arrayObjectProperties: updatedProps,
                  });
                }}
                className="btn-add-nested-prop"
              >
                + Proprietà
              </button>
            </div>
            {!parameter.arrayObjectProperties || Object.keys(parameter.arrayObjectProperties).length === 0 ? (
              <p className="nested-empty">Nessuna proprietà configurata</p>
            ) : (
              <div className="nested-properties-list">
                {Object.entries(parameter.arrayObjectProperties).map(([propName, propValue]) => (
                  <div key={propName} className="nested-prop-item">
                    <input
                      type="text"
                      value={propName}
                      onChange={(e) => {
                        const newPropName = e.target.value;
                        const oldProps = parameter.arrayObjectProperties || {};
                        const newProps = { ...oldProps };
                        const oldProp = newProps[propName];
                        delete newProps[propName];
                        newProps[newPropName] = oldProp;
                        onParameterChange({
                          ...parameter,
                          arrayObjectProperties: newProps,
                        });
                      }}
                      placeholder="Nome proprietà"
                      className="nested-prop-name"
                    />
                    <select
                      value={propValue.type}
                      onChange={(e) => {
                        const newType = e.target.value as ParameterType | 'array' | 'object';
                        const updatedProps = { ...parameter.arrayObjectProperties };
                        updatedProps[propName] = {
                          ...updatedProps[propName],
                          type: newType as any,
                        };
                        onParameterChange({
                          ...parameter,
                          arrayObjectProperties: updatedProps,
                        });
                      }}
                      className="nested-prop-type"
                    >
                      <optgroup label="Tipi Primitivi">
                        {PRIMITIVE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Tipi Complessi">
                        <option value="array">array</option>
                        <option value="object">object</option>
                      </optgroup>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedProps = { ...parameter.arrayObjectProperties };
                        delete updatedProps[propName];
                        onParameterChange({
                          ...parameter,
                          arrayObjectProperties: updatedProps,
                        });
                      }}
                      className="btn-remove-nested-prop"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={parameter.required || false}
              onChange={(e) => onParameterChange({ ...parameter, required: e.target.checked })}
            />
            Parametro Obbligatorio
          </label>
        </div>

        <div className="form-group">
          <label>Descrizione</label>
          <textarea
            value={parameter.description || ''}
            onChange={(e) => onParameterChange({ ...parameter, description: e.target.value })}
            placeholder="Descrizione opzionale del parametro"
            rows={3}
          />
        </div>

        {parameter.type === 'object' && (
          <div className="object-properties">
            <div className="object-header">
              <h5>Proprietà Oggetto</h5>
              <button
                type="button"
                onClick={addObjectProperty}
                className="btn-add-prop"
              >
                + Proprietà
              </button>
            </div>

            {!parameter.objectProperties || Object.keys(parameter.objectProperties).length === 0 ? (
              <div className="object-empty">
                <p>Nessuna proprietà. Clicca "+ Proprietà" per aggiungerne.</p>
              </div>
            ) : (
              <div className="properties-list">
                {Object.entries(parameter.objectProperties).map(([propName, propValue]) =>
                  renderNestedProperty(
                    propName,
                    propValue,
                    'root',
                    (updates) => updateObjectProperty(propName, updates),
                    (oldName, newName) => renameObjectProperty(oldName, newName),
                    () => removeObjectProperty(propName)
                  )
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
