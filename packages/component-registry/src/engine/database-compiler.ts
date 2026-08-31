import { DataModel, ApiRouteConfig, DataModelField } from '@nirmaanify/types';

export class DatabaseCompiler {
  // ==========================================================================
  // 1. PRISMA POSTGRESQL SCHEMA COMPILER
  // ==========================================================================

  static compilePrismaSchema(models: DataModel[]): string {
    let output = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

`;

    // 1. Collect all custom Enums
    const collectedEnums = new Map<string, string[]>();
    models.forEach((m) => {
      m.fields.forEach((f) => {
        if (f.type === 'Enum' && f.enumValues && f.enumValues.length > 0) {
          const enumName = `${m.name}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
          collectedEnums.set(enumName, f.enumValues);
        }
      });
    });

    collectedEnums.forEach((values, name) => {
      output += `enum ${name} {\n  ${values.join('\n  ')}\n}\n\n`;
    });

    // 2. Generate Prisma Models
    models.forEach((m) => {
      output += `model ${m.name} {\n`;

      m.fields.forEach((f) => {
        let typeStr = this.mapFieldTypeToPrisma(f, m.name);

        if (f.isNullable && f.type !== 'Relation') {
          typeStr += '?';
        }

        let attributes = '';
        if (f.isId) attributes += ' @id';
        if (f.defaultValue === 'uuid()') attributes += ' @default(uuid())';
        else if (f.defaultValue === 'now()') attributes += ' @default(now())';
        else if (f.defaultValue !== undefined && f.defaultValue !== '') {
          if (f.type === 'Int' || f.type === 'Float' || f.type === 'Boolean') {
            attributes += ` @default(${f.defaultValue})`;
          } else if (f.type === 'Enum') {
            attributes += ` @default(${f.defaultValue})`;
          } else {
            attributes += ` @default("${f.defaultValue}")`;
          }
        }

        if (f.isUnique && !f.isId) attributes += ' @unique';

        if (f.type === 'Relation') {
          if (f.relationType === 'ONE_TO_MANY') {
            typeStr = `${f.relationTarget}[]`;
          } else if (f.relationType === 'MANY_TO_ONE' && f.relationForeignKey) {
            typeStr = `${f.relationTarget}?`;
            attributes += ` @relation(fields: [${f.relationForeignKey}], references: [id])`;
          }
        }

        output += `  ${f.name.padEnd(16)} ${typeStr}${attributes}\n`;

        // If relation has a foreign key that is not yet added, add it
        if (f.type === 'Relation' && f.relationForeignKey) {
          const fkExists = m.fields.some((other) => other.name === f.relationForeignKey);
          if (!fkExists) {
            output += `  ${f.relationForeignKey.padEnd(16)} String?\n`;
          }
        }
      });

      output += `}\n\n`;
    });

    return output;
  }

  // ==========================================================================
  // 2. MERMAID.JS VISUAL ER DIAGRAM COMPILER
  // ==========================================================================

  static compileErDiagramMermaid(models: DataModel[]): string {
    let mermaid = 'erDiagram\n';

    // 1. Entities with attributes
    models.forEach((m) => {
      mermaid += `  ${m.name} {\n`;
      m.fields.forEach((f) => {
        if (f.type !== 'Relation') {
          const typeDisplay = f.type.toLowerCase();
          const pkFk = f.isId ? 'PK' : f.isUnique ? 'UK' : '';
          mermaid += `    ${typeDisplay} ${f.name} ${pkFk}\n`;
        }
      });
      mermaid += `  }\n`;
    });

    // 2. Relationship lines
    models.forEach((m) => {
      m.fields.forEach((f) => {
        if (f.type === 'Relation' && f.relationTarget) {
          if (f.relationType === 'ONE_TO_MANY') {
            mermaid += `  ${m.name} ||--o{ ${f.relationTarget} : "has_many"\n`;
          } else if (f.relationType === 'MANY_TO_ONE') {
            mermaid += `  ${f.relationTarget} ||--o{ ${m.name} : "contains"\n`;
          } else if (f.relationType === 'ONE_TO_ONE') {
            mermaid += `  ${m.name} ||--|| ${f.relationTarget} : "relates_to"\n`;
          }
        }
      });
    });

    return mermaid;
  }

  // ==========================================================================
  // 3. API ROUTE GENERATORS
  // ==========================================================================

  static generateDefaultApiRoutes(models: DataModel[]): ApiRouteConfig[] {
    const routes: ApiRouteConfig[] = [];

    models.forEach((m) => {
      const slug = m.pluralName.toLowerCase();
      routes.push(
        {
          id: `route-${m.id}-list`,
          modelId: m.id,
          modelName: m.name,
          path: `/${slug}`,
          method: 'GET',
          operation: 'LIST',
          authRequired: m.name === 'User' || m.name === 'Order',
          enabled: true,
          allowFiltering: true,
          allowSorting: true,
        },
        {
          id: `route-${m.id}-get`,
          modelId: m.id,
          modelName: m.name,
          path: `/${slug}/:id`,
          method: 'GET',
          operation: 'GET_ONE',
          authRequired: false,
          enabled: true,
        },
        {
          id: `route-${m.id}-create`,
          modelId: m.id,
          modelName: m.name,
          path: `/${slug}`,
          method: 'POST',
          operation: 'CREATE',
          authRequired: true,
          roles: ['ADMIN', 'DEVELOPER'],
          enabled: true,
        },
        {
          id: `route-${m.id}-update`,
          modelId: m.id,
          modelName: m.name,
          path: `/${slug}/:id`,
          method: 'PATCH',
          operation: 'UPDATE',
          authRequired: true,
          roles: ['ADMIN'],
          enabled: true,
        },
        {
          id: `route-${m.id}-delete`,
          modelId: m.id,
          modelName: m.name,
          path: `/${slug}/:id`,
          method: 'DELETE',
          operation: 'DELETE',
          authRequired: true,
          roles: ['ADMIN'],
          enabled: true,
        }
      );
    });

    return routes;
  }

  private static mapFieldTypeToPrisma(f: DataModelField, modelName: string): string {
    switch (f.type) {
      case 'String':
        return 'String';
      case 'Int':
        return 'Int';
      case 'Float':
        return 'Float';
      case 'Boolean':
        return 'Boolean';
      case 'DateTime':
        return 'DateTime';
      case 'Json':
        return 'Json';
      case 'Enum':
        return `${modelName}${f.name.charAt(0).toUpperCase() + f.name.slice(1)}`;
      case 'Relation':
        return f.relationTarget || 'String';
      default:
        return 'String';
    }
  }
}
