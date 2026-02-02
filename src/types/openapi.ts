export interface OpenAPIProject {
  name: string;
  version: string;
  spec: OpenAPISpec;
  createdAt: Date;
  updatedAt: Date;
}

export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: Record<string, any>;
  components?: {
    schemas?: Record<string, any>;
  };
}
