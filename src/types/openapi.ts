export interface OpenAPIProject {
  name: string;
  version: string;
  spec: OpenAPISpec;
  createdAt: Date;
  updatedAt: Date;
}

export type ParameterType = 'string' | 'number' | 'boolean' | 'integer';

export interface QueryParameter {
  name: string;
  type: ParameterType | 'array' | 'object';
  required?: boolean;
  description?: string;
  arrayType?: ParameterType | 'array' | 'object'; // per array di tipi primitivi e complessi
  arrayObjectProperties?: Record<string, QueryParameter>; // per array di object
  objectProperties?: Record<string, QueryParameter>; // per object
}

export interface APIOperation {
  summary?: string;
  description?: string;
  security?: Record<string, string[]>[];
  parameters?: QueryParameter[];
  requestBody?: QueryParameter; // Body per POST, PUT, PATCH
  responses: {
    [statusCode: string]: {
      description: string;
    };
  };
}

export interface APIPath {
  [method: string]: APIOperation;
}

export interface SecurityScheme {
  type: 'apiKey' | 'http' | 'oauth2';
  in?: 'query' | 'header' | 'cookie';
  name?: string;
  scheme?: string;
  flows?: {
    authorizationCode?: {
      authorizationUrl: string;
      tokenUrl: string;
      scopes: Record<string, string>;
    };
  };
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, APIPath>;
  components?: {
    schemas?: Record<string, unknown>;
    securitySchemes?: Record<string, SecurityScheme>;
  };
}
