import { describe, it, expect } from 'vitest';
import { NestJsCodeGenerator } from './nestjs-generator';
import { createDefaultProjectBackendSchema } from '@nirmaanify/types';

describe('NestJsCodeGenerator (Phase 8 — Backend Builder & NestJS Generation)', () => {
  it('should generate a full NestJS project structure with default enabled modules', () => {
    const schema = createDefaultProjectBackendSchema();
    const result = NestJsCodeGenerator.generateProject('proj-123', 'MyStore', schema);

    expect(result.projectId).toBe('proj-123');
    expect(result.projectName).toBe('MyStore');
    expect(result.totalFiles).toBeGreaterThan(15);

    // Root files
    expect(result.files['package.json']).toBeDefined();
    expect(result.files['package.json'].content).toContain('@nestjs/core');
    expect(result.files['package.json'].content).toContain('mystore-backend');

    expect(result.files['tsconfig.json']).toBeDefined();
    expect(result.files['nest-cli.json']).toBeDefined();
    expect(result.files['.env.example']).toBeDefined();
    expect(result.files['docker-compose.yml']).toBeDefined();
    expect(result.files['README.md']).toBeDefined();

    // Prisma
    expect(result.files['prisma/schema.prisma']).toBeDefined();
    expect(result.files['prisma/schema.prisma'].content).toContain('datasource db');
    expect(result.files['prisma/schema.prisma'].content).toContain('model User');
    expect(result.files['prisma/schema.prisma'].content).toContain('model Product');
    expect(result.files['prisma/schema.prisma'].content).toContain('model Category');
    expect(result.files['src/prisma/prisma.service.ts']).toBeDefined();
    expect(result.files['src/prisma/prisma.module.ts']).toBeDefined();

    // Security & Guards
    expect(result.files['src/common/guards/jwt-auth.guard.ts']).toBeDefined();
    expect(result.files['src/common/guards/roles.guard.ts']).toBeDefined();
    expect(result.files['src/common/decorators/roles.decorator.ts']).toBeDefined();
    expect(result.files['src/common/decorators/current-user.decorator.ts']).toBeDefined();

    // Modules
    expect(result.files['src/modules/auth/auth.module.ts']).toBeDefined();
    expect(result.files['src/modules/auth/auth.controller.ts']).toBeDefined();
    expect(result.files['src/modules/auth/auth.service.ts']).toBeDefined();
    expect(result.files['src/modules/auth/jwt.strategy.ts']).toBeDefined();
    expect(result.files['src/modules/auth/dto/register.dto.ts']).toBeDefined();
    expect(result.files['src/modules/auth/dto/login.dto.ts']).toBeDefined();

    expect(result.files['src/modules/products/products.module.ts']).toBeDefined();
    expect(result.files['src/modules/products/products.controller.ts']).toBeDefined();
    expect(result.files['src/modules/products/products.service.ts']).toBeDefined();
    expect(result.files['src/modules/products/dto/create-product.dto.ts']).toBeDefined();

    // App Module & Main Bootstrap
    expect(result.files['src/app.module.ts']).toBeDefined();
    expect(result.files['src/app.module.ts'].content).toContain('AuthModule');
    expect(result.files['src/app.module.ts'].content).toContain('ProductsModule');

    expect(result.files['src/main.ts']).toBeDefined();
    expect(result.files['src/main.ts'].content).toContain('ValidationPipe');
    expect(result.files['src/main.ts'].content).toContain('SwaggerModule');

    // Frontend Connection Client (Week 27)
    expect(result.files['src/client/api-client.ts']).toBeDefined();
    expect(result.files['src/client/api-client.ts'].content).toContain('ProjectApiClient');
  });

  it('should include only enabled modules in AppModule and Prisma Schema', () => {
    const schema = createDefaultProjectBackendSchema();
    // Enable payments and blog, disable orders and categories
    schema.modules.payments.enabled = true;
    schema.modules.blog.enabled = true;
    schema.modules.orders.enabled = false;
    schema.modules.categories.enabled = false;

    const result = NestJsCodeGenerator.generateProject('proj-custom', 'CustomApp', schema);

    // Payments and Blog are present
    expect(result.files['src/modules/payments/payments.module.ts']).toBeDefined();
    expect(result.files['src/modules/payments/payments.controller.ts']).toBeDefined();
    expect(result.files['src/modules/blog/blog.module.ts']).toBeDefined();
    expect(result.files['src/app.module.ts'].content).toContain('PaymentsModule');
    expect(result.files['src/app.module.ts'].content).toContain('BlogModule');
    expect(result.files['prisma/schema.prisma'].content).toContain('model Payment');
    expect(result.files['prisma/schema.prisma'].content).toContain('model BlogPost');

    // Orders and Categories are excluded
    expect(result.files['src/modules/orders/orders.module.ts']).toBeUndefined();
    expect(result.files['src/modules/categories/categories.module.ts']).toBeUndefined();
    expect(result.files['src/app.module.ts'].content).not.toContain('OrdersModule');
    expect(result.files['src/app.module.ts'].content).not.toContain('CategoriesModule');
  });

  it('should generate project data sources matching enabled backend routes for frontend binding (Week 27)', () => {
    const schema = createDefaultProjectBackendSchema();
    const dataSources = NestJsCodeGenerator.generateDataSources(schema);

    expect(dataSources.length).toBeGreaterThan(5);

    const authRegisterDs = dataSources.find((ds) => ds.id === 'ds-auth-register');
    expect(authRegisterDs).toBeDefined();
    expect(authRegisterDs?.endpoint).toBe('/api/v1/auth/register');
    expect(authRegisterDs?.method).toBe('POST');

    const productsListDs = dataSources.find((ds) => ds.id === 'ds-products-findAll');
    expect(productsListDs).toBeDefined();
    expect(productsListDs?.endpoint).toBe('/api/v1/products');
    expect(productsListDs?.method).toBe('GET');
  });
});
