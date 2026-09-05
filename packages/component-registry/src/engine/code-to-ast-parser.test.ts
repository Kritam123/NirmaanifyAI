import { describe, it, expect } from 'vitest';
import { CodeToAstParser } from './code-to-ast-parser';
import { ReactCodeGenerator } from './code-generator';

describe('CodeToAstParser', () => {
  it('parses JSX with buttons, badges, and cards into ComponentNode tree', () => {
    const tsx = `
      export default function HeroPage() {
        return (
          <main className="flex flex-col gap-4 p-6">
            <Badge text="Production Ready" variant="default" />
            <Heading text="Build Faster with AI" level={1} />
            <Text text="The autonomous full-stack visual studio" />
            <Button text="Start Building" variant="default" />
            <Card title="Features" description="Real-time multi-file sync" />
          </main>
        );
      }
    `;

    const page = CodeToAstParser.parsePage(tsx, 'HeroPage', '/');
    expect(page.name).toBe('HeroPage');
    expect(page.rootNode).toBeDefined();

    const root = page.rootNode;
    expect(root.children).toBeDefined();
    expect(root.children?.length).toBeGreaterThanOrEqual(4);

    const types = root.children?.map((c) => c.type);
    expect(types).toContain('badge');
    expect(types).toContain('heading');
    expect(types).toContain('text');
    const headingNode = root.children?.find((c) => c.type === 'heading');
    expect(headingNode).toBeDefined();
    expect(headingNode?.props.level).toBe('h1');
  });

  it('generates multi-file project files from ProjectSchema', () => {
    const projectSchema = {
      version: '1.0.0',
      settings: { name: 'SaaS App' },
      pages: [
        {
          id: 'p1',
          name: 'Home',
          path: '/',
          title: 'Home Page',
          rootNode: {
            id: 'n1',
            type: 'container',
            name: 'Root',
            props: {},
            children: [
              {
                id: 'n2',
                type: 'button',
                name: 'Button',
                props: { text: 'Click Here' },
              },
            ],
          },
        },
      ],
    } as any;

    const files = ReactCodeGenerator.generateProjectFiles(projectSchema);
    expect(files['app/page.tsx']).toBeDefined();
    expect(files['app/page.tsx']).toContain('Click Here');
    expect(files['app/layout.tsx']).toBeDefined();
    expect(files['app/globals.css']).toBeDefined();
    expect(files['src/main.ts']).toBeDefined();
    expect(files['src/app.module.ts']).toBeDefined();
    expect(files['prisma/schema.prisma']).toBeDefined();
  });
});
