import {
  ProjectBackendSchema,
  BackendModuleConfig,
  PredefinedModuleId,
  NestJsGeneratedFile,
  NestJsProjectCode,
  ProjectDataSource,
  PREDEFINED_BACKEND_MODULES,
} from '@nirmaanify/types';

export class NestJsCodeGenerator {
  /**
   * Main entry point: Generates a complete, production-grade NestJS 11 project codebase.
   */
  static generateProject(
    projectId: string,
    projectName: string,
    schema: ProjectBackendSchema
  ): NestJsProjectCode {
    const files: Record<string, NestJsGeneratedFile> = {};
    const settings = schema.settings;

    // Filter enabled modules
    const enabledModules = Object.values(schema.modules).filter((m) => m.enabled);

    // 1. Root & Configuration files
    files['package.json'] = {
      path: 'package.json',
      content: this.generatePackageJson(projectName),
      language: 'json',
      description: 'Project dependencies and NestJS build scripts',
    };

    files['tsconfig.json'] = {
      path: 'tsconfig.json',
      content: this.generateTsConfig(),
      language: 'json',
      description: 'TypeScript compiler configuration',
    };

    files['nest-cli.json'] = {
      path: 'nest-cli.json',
      content: this.generateNestCliJson(),
      language: 'json',
      description: 'NestJS CLI build schematics',
    };

    files['.env.example'] = {
      path: '.env.example',
      content: this.generateEnvFile(schema),
      language: 'env',
      description: 'Environment variable configuration template',
    };

    files['docker-compose.yml'] = {
      path: 'docker-compose.yml',
      content: this.generateDockerCompose(projectName, settings.port),
      language: 'yaml',
      description: 'Local development PostgreSQL and Redis container orchestration',
    };

    files['README.md'] = {
      path: 'README.md',
      content: this.generateReadme(projectName, schema),
      language: 'markdown',
      description: 'Setup and deployment guide',
    };

    // 2. Prisma ORM schema & service
    files['prisma/schema.prisma'] = {
      path: 'prisma/schema.prisma',
      content: this.generatePrismaSchema(enabledModules, schema),
      language: 'prisma',
      description: 'Prisma schema models, indexes, and relations',
    };

    files['src/prisma/prisma.service.ts'] = {
      path: 'src/prisma/prisma.service.ts',
      content: this.generatePrismaService(),
      language: 'typescript',
      description: 'Prisma Client database connection lifecycle manager',
    };

    files['src/prisma/prisma.module.ts'] = {
      path: 'src/prisma/prisma.module.ts',
      content: this.generatePrismaModule(),
      language: 'typescript',
      description: 'Global Prisma database module',
    };

    // 3. Security, Guards & Decorators
    files['src/common/guards/jwt-auth.guard.ts'] = {
      path: 'src/common/guards/jwt-auth.guard.ts',
      content: this.generateJwtGuard(),
      language: 'typescript',
      description: 'Passport JWT authentication guard',
    };

    files['src/common/guards/roles.guard.ts'] = {
      path: 'src/common/guards/roles.guard.ts',
      content: this.generateRolesGuard(),
      language: 'typescript',
      description: 'Role-Based Access Control (RBAC) authorization guard',
    };

    files['src/common/decorators/roles.decorator.ts'] = {
      path: 'src/common/decorators/roles.decorator.ts',
      content: this.generateRolesDecorator(),
      language: 'typescript',
      description: '@Roles decorator for route authorization',
    };

    files['src/common/decorators/current-user.decorator.ts'] = {
      path: 'src/common/decorators/current-user.decorator.ts',
      content: this.generateCurrentUserDecorator(),
      language: 'typescript',
      description: '@CurrentUser parameter decorator',
    };

    // 4. Module Generation for each enabled module
    for (const mod of enabledModules) {
      const modFiles = this.generateModuleFiles(mod, schema);
      for (const [relPath, file] of Object.entries(modFiles)) {
        files[relPath] = file;
      }
    }

    // 5. Main NestJS application bootstrap & root AppModule
    files['src/app.module.ts'] = {
      path: 'src/app.module.ts',
      content: this.generateAppModule(enabledModules, schema),
      language: 'typescript',
      description: 'Root AppModule aggregating active feature modules',
    };

    files['src/main.ts'] = {
      path: 'src/main.ts',
      content: this.generateMainTs(schema),
      language: 'typescript',
      description: 'NestFactory application entry point with Swagger & ValidationPipe',
    };

    // 6. Frontend API Client & Connection (Week 27)
    files['src/client/api-client.ts'] = {
      path: 'src/client/api-client.ts',
      content: this.generateFrontendApiClient(enabledModules, schema),
      language: 'typescript',
      description: 'Typed frontend client for Next.js to connect to NestJS API',
    };

    return {
      projectId,
      projectName,
      files,
      fileList: Object.keys(files).sort(),
      totalFiles: Object.keys(files).length,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generates ProjectDataSource items for each enabled NestJS module (Week 27)
   */
  static generateDataSources(schema: ProjectBackendSchema): ProjectDataSource[] {
    const dataSources: ProjectDataSource[] = [];
    const prefix = schema.settings.globalPrefix.replace(/^\//, '');

    for (const mod of Object.values(schema.modules)) {
      if (!mod.enabled) continue;
      for (const ep of mod.endpoints) {
        const fullEndpoint = `/${prefix}${ep.path.startsWith('/') ? ep.path : '/' + ep.path}`;
        dataSources.push({
          id: `ds-${mod.id}-${ep.actionName}`,
          name: `${mod.name}: ${ep.actionName}`,
          type: 'rest',
          endpoint: fullEndpoint,
          method: ep.method as 'GET' | 'POST',
          headers: ep.authRequired ? { Authorization: 'Bearer {{token}}' } : undefined,
          data: ep.responseExample || { status: 'ok', module: mod.id },
        });
      }
    }

    return dataSources;
  }

  // ==========================================
  // MODULE GENERATORS
  // ==========================================

  private static generateModuleFiles(
    mod: BackendModuleConfig,
    schema: ProjectBackendSchema
  ): Record<string, NestJsGeneratedFile> {
    const files: Record<string, NestJsGeneratedFile> = {};
    const modId = mod.id;
    const baseDir = `src/modules/${modId}`;

    switch (modId) {
      case 'auth':
        files[`${baseDir}/auth.module.ts`] = {
          path: `${baseDir}/auth.module.ts`,
          content: this.generateAuthModuleCode(mod),
          language: 'typescript',
          description: 'AuthModule with JwtModule and PassportModule registration',
        };
        files[`${baseDir}/auth.controller.ts`] = {
          path: `${baseDir}/auth.controller.ts`,
          content: this.generateAuthControllerCode(mod),
          language: 'typescript',
          description: 'AuthController with register, login, me, and refresh routes',
        };
        files[`${baseDir}/auth.service.ts`] = {
          path: `${baseDir}/auth.service.ts`,
          content: this.generateAuthServiceCode(mod),
          language: 'typescript',
          description: 'AuthService with bcrypt password hashing & JWT token issuing',
        };
        files[`${baseDir}/jwt.strategy.ts`] = {
          path: `${baseDir}/jwt.strategy.ts`,
          content: this.generateJwtStrategyCode(schema),
          language: 'typescript',
          description: 'Passport JWT strategy for bearer token verification',
        };
        files[`${baseDir}/dto/register.dto.ts`] = {
          path: `${baseDir}/dto/register.dto.ts`,
          content: `import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
`,
          language: 'typescript',
          description: 'Registration payload validator',
        };
        files[`${baseDir}/dto/login.dto.ts`] = {
          path: `${baseDir}/dto/login.dto.ts`,
          content: `import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
`,
          language: 'typescript',
          description: 'Login payload validator',
        };
        break;

      case 'products':
        files[`${baseDir}/products.module.ts`] = {
          path: `${baseDir}/products.module.ts`,
          content: this.generateStandardModuleCode('Products', 'products'),
          language: 'typescript',
          description: 'ProductsModule definition',
        };
        files[`${baseDir}/products.controller.ts`] = {
          path: `${baseDir}/products.controller.ts`,
          content: this.generateProductsControllerCode(mod),
          language: 'typescript',
          description: 'ProductsController REST endpoints',
        };
        files[`${baseDir}/products.service.ts`] = {
          path: `${baseDir}/products.service.ts`,
          content: this.generateProductsServiceCode(mod),
          language: 'typescript',
          description: 'ProductsService Prisma CRUD queries',
        };
        files[`${baseDir}/dto/create-product.dto.ts`] = {
          path: `${baseDir}/dto/create-product.dto.ts`,
          content: `import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Wireless Headphones' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'wireless-headphones' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'High-fidelity audio with active noise cancellation' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 199.99 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  stock?: number;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e' })
  @IsString()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ example: 'category-uuid-here' })
  @IsString()
  @IsOptional()
  categoryId?: string;
}
`,
          language: 'typescript',
        };
        files[`${baseDir}/dto/update-product.dto.ts`] = {
          path: `${baseDir}/dto/update-product.dto.ts`,
          content: `import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
`,
          language: 'typescript',
        };
        break;

      case 'categories':
        files[`${baseDir}/categories.module.ts`] = {
          path: `${baseDir}/categories.module.ts`,
          content: this.generateStandardModuleCode('Categories', 'categories'),
          language: 'typescript',
        };
        files[`${baseDir}/categories.controller.ts`] = {
          path: `${baseDir}/categories.controller.ts`,
          content: this.generateCategoriesControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/categories.service.ts`] = {
          path: `${baseDir}/categories.service.ts`,
          content: this.generateCategoriesServiceCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/dto/create-category.dto.ts`] = {
          path: `${baseDir}/dto/create-category.dto.ts`,
          content: `import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Electronics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'electronics' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'Laptops, headphones, and accessories' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'parent-category-id' })
  @IsString()
  @IsOptional()
  parentId?: string;
}
`,
          language: 'typescript',
        };
        break;

      case 'orders':
        files[`${baseDir}/orders.module.ts`] = {
          path: `${baseDir}/orders.module.ts`,
          content: this.generateStandardModuleCode('Orders', 'orders'),
          language: 'typescript',
        };
        files[`${baseDir}/orders.controller.ts`] = {
          path: `${baseDir}/orders.controller.ts`,
          content: this.generateOrdersControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/orders.service.ts`] = {
          path: `${baseDir}/orders.service.ts`,
          content: this.generateOrdersServiceCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/dto/create-order.dto.ts`] = {
          path: `${baseDir}/dto/create-order.dto.ts`,
          content: `import { IsArray, IsNotEmpty, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOrderDto {
  @ApiProperty({ example: 249.99 })
  @IsNumber()
  @Min(0)
  totalAmount: number;

  @ApiProperty({ example: [{ productId: 'uuid', quantity: 2, price: 99.99 }] })
  @IsArray()
  @IsNotEmpty()
  items: any[];

  @ApiPropertyOptional({ example: { street: '123 Market St', city: 'San Francisco', zip: '94105' } })
  @IsOptional()
  shippingAddress?: Record<string, any>;
}
`,
          language: 'typescript',
        };
        break;

      case 'payments':
        files[`${baseDir}/payments.module.ts`] = {
          path: `${baseDir}/payments.module.ts`,
          content: this.generateStandardModuleCode('Payments', 'payments'),
          language: 'typescript',
        };
        files[`${baseDir}/payments.controller.ts`] = {
          path: `${baseDir}/payments.controller.ts`,
          content: this.generatePaymentsControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/payments.service.ts`] = {
          path: `${baseDir}/payments.service.ts`,
          content: this.generatePaymentsServiceCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/dto/payment-intent.dto.ts`] = {
          path: `${baseDir}/dto/payment-intent.dto.ts`,
          content: `import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentIntentDto {
  @ApiProperty({ example: 'order-uuid-123' })
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber()
  @Min(0.5)
  amount: number;

  @ApiProperty({ example: 'usd' })
  @IsString()
  @IsOptional()
  currency?: string;
}
`,
          language: 'typescript',
        };
        break;

      case 'blog':
        files[`${baseDir}/blog.module.ts`] = {
          path: `${baseDir}/blog.module.ts`,
          content: this.generateStandardModuleCode('Blog', 'blog'),
          language: 'typescript',
        };
        files[`${baseDir}/blog.controller.ts`] = {
          path: `${baseDir}/blog.controller.ts`,
          content: this.generateBlogControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/blog.service.ts`] = {
          path: `${baseDir}/blog.service.ts`,
          content: this.generateBlogServiceCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/dto/create-post.dto.ts`] = {
          path: `${baseDir}/dto/create-post.dto.ts`,
          content: `import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBlogPostDto {
  @ApiProperty({ example: 'Getting Started with Next.js and NestJS' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'getting-started-nextjs-nestjs' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ example: '# Hello World\\n\\nThis is a generated blog post.' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiPropertyOptional({ example: 'A beginner guide to fullstack TypeScript.' })
  @IsString()
  @IsOptional()
  excerpt?: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97' })
  @IsString()
  @IsOptional()
  coverImage?: string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  published?: boolean;
}
`,
          language: 'typescript',
        };
        break;

      case 'notifications':
        files[`${baseDir}/notifications.module.ts`] = {
          path: `${baseDir}/notifications.module.ts`,
          content: this.generateStandardModuleCode('Notifications', 'notifications'),
          language: 'typescript',
        };
        files[`${baseDir}/notifications.controller.ts`] = {
          path: `${baseDir}/notifications.controller.ts`,
          content: this.generateNotificationsControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/notifications.service.ts`] = {
          path: `${baseDir}/notifications.service.ts`,
          content: this.generateNotificationsServiceCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/dto/send-notification.dto.ts`] = {
          path: `${baseDir}/dto/send-notification.dto.ts`,
          content: `import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({ example: 'user-uuid-123' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Order Confirmed' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your order #1024 has been verified and is being prepared.' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ example: '/orders/1024' })
  @IsString()
  @IsOptional()
  link?: string;
}
`,
          language: 'typescript',
        };
        break;

      case 'uploads':
        files[`${baseDir}/uploads.module.ts`] = {
          path: `${baseDir}/uploads.module.ts`,
          content: this.generateStandardModuleCode('Uploads', 'uploads'),
          language: 'typescript',
        };
        files[`${baseDir}/uploads.controller.ts`] = {
          path: `${baseDir}/uploads.controller.ts`,
          content: this.generateUploadsControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/uploads.service.ts`] = {
          path: `${baseDir}/uploads.service.ts`,
          content: this.generateUploadsServiceCode(mod),
          language: 'typescript',
        };
        break;

      case 'users':
      default:
        files[`${baseDir}/users.module.ts`] = {
          path: `${baseDir}/users.module.ts`,
          content: this.generateStandardModuleCode('Users', 'users'),
          language: 'typescript',
        };
        files[`${baseDir}/users.controller.ts`] = {
          path: `${baseDir}/users.controller.ts`,
          content: this.generateUsersControllerCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/users.service.ts`] = {
          path: `${baseDir}/users.service.ts`,
          content: this.generateUsersServiceCode(mod),
          language: 'typescript',
        };
        files[`${baseDir}/dto/update-user.dto.ts`] = {
          path: `${baseDir}/dto/update-user.dto.ts`,
          content: `import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jane Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  @IsString()
  @IsOptional()
  avatarUrl?: string;
}
`,
          language: 'typescript',
        };
        break;
    }

    return files;
  }

  // ==========================================
  // TEMPLATE CODE GENERATORS
  // ==========================================

  private static generateStandardModuleCode(classNamePrefix: string, folderName: string): string {
    return `import { Module } from '@nestjs/common';
import { ${classNamePrefix}Controller } from './${folderName}.controller';
import { ${classNamePrefix}Service } from './${folderName}.service';

@Module({
  controllers: [${classNamePrefix}Controller],
  providers: [${classNamePrefix}Service],
  exports: [${classNamePrefix}Service],
})
export class ${classNamePrefix}Module {}
`;
  }

  private static generateAuthModuleCode(mod: BackendModuleConfig): string {
    return `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'dev-secret'),
        signOptions: {
          expiresIn: config.get<string>('JWT_EXPIRATION', '${mod.settings?.tokenExpiration || '7d'}'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
`;
  }

  private static generateAuthControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user account' })
  @ApiResponse({ status: 201, description: 'User successfully created' })
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate user credentials' })
  @ApiResponse({ status: 200, description: 'JWT authentication token' })
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retrieve authenticated profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.authService.getProfile(userId);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh active JWT session' })
  async refreshToken(@CurrentUser() user: any) {
    return this.authService.refreshToken(user);
  }
}
`;
  }

  private static generateAuthServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        name: dto.name,
        role: 'MEMBER',
      },
    });

    const token = this.generateToken(user);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.generateToken(user);
    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken: token,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new UnauthorizedException('User session not found');
    return user;
  }

  async refreshToken(user: any) {
    return {
      accessToken: this.generateToken(user),
    };
  }

  private generateToken(user: any): string {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return this.jwtService.sign(payload);
  }
}
`;
  }

  private static generateJwtStrategyCode(schema: ProjectBackendSchema): string {
    return `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', '${schema.settings.jwtSecret}'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid authorization token');
    }
    return user;
  }
}
`;
  }

  private static generateProductsControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'List products with optional search and category filter' })
  async findAll(@Query('search') search?: string, @Query('categoryId') categoryId?: string) {
    return this.productsService.findAll({ search, categoryId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single product by ID or slug' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create new product item (Admin only)' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product item (Admin only)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete product item (Admin only)' })
  async remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
`;
  }

  private static generateProductsServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(params: { search?: string; categoryId?: string }) {
    const where: any = {};
    if (params.categoryId) where.categoryId = params.categoryId;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }
    return this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async findOne(idOrSlug: string) {
    const product = await this.prisma.product.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: dto,
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.product.delete({ where: { id } });
  }
}
`;
  }

  private static generateCategoriesControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all categories' })
  async findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get category by ID or slug' })
  async findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create category (Admin)' })
  async create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete category (Admin)' })
  async remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
`;
  }

  private static generateCategoriesServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { products: true },
    });
  }

  async findOne(idOrSlug: string) {
    const category = await this.prisma.category.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { products: true },
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  async remove(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }
}
`;
  }

  private static generateOrdersControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get customer orders list' })
  async findAll(@CurrentUser('id') userId: string) {
    return this.ordersService.findUserOrders(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Checkout and create order' })
  async create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: string) {
    return this.ordersService.create(userId, dto);
  }
}
`;
  }

  private static generateOrdersServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserOrders(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(userId: string, dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        userId,
        totalAmount: dto.totalAmount,
        items: dto.items,
        shippingAddress: dto.shippingAddress || {},
        status: 'PENDING',
      },
    });
  }
}
`;
  }

  private static generatePaymentsControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/payment-intent.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment gateway intent' })
  async createIntent(@Body() dto: CreatePaymentIntentDto) {
    return this.paymentsService.createIntent(dto);
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle external gateway webhooks' })
  async handleWebhook(@Body() payload: any) {
    return this.paymentsService.handleWebhook(payload);
  }
}
`;
  }

  private static generatePaymentsServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentIntentDto } from './dto/payment-intent.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIntent(dto: CreatePaymentIntentDto) {
    const payment = await this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        amount: dto.amount,
        currency: dto.currency || 'usd',
        provider: 'stripe',
        status: 'PENDING',
      },
    });
    return {
      clientSecret: \`pi_mock_\${payment.id}_secret\`,
      paymentId: payment.id,
      amount: payment.amount,
    };
  }

  async handleWebhook(payload: any) {
    return { received: true, timestamp: new Date().toISOString() };
  }
}
`;
  }

  private static generateBlogControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-post.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  @ApiOperation({ summary: 'List published articles' })
  async findAll() {
    return this.blogService.findAll();
  }

  @Get('posts/:slug')
  @ApiOperation({ summary: 'Get article by slug' })
  async findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish new article post' })
  async create(@Body() dto: CreateBlogPostDto, @CurrentUser('id') authorId: string) {
    return this.blogService.create(authorId, dto);
  }
}
`;
  }

  private static generateBlogServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-post.dto';

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      include: { author: { select: { id: true, name: true, email: true } } },
    });
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true } } },
    });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(authorId: string, dto: CreateBlogPostDto) {
    return this.prisma.blogPost.create({
      data: {
        ...dto,
        authorId,
      },
    });
  }
}
`;
  }

  private static generateNotificationsControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Get, Patch, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications for current user' })
  async findMyNotifications(@CurrentUser('id') userId: string) {
    return this.notificationsService.findUserNotifications(userId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }
}
`;
  }

  private static generateNotificationsServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
}
`;
  }

  private static generateUploadsControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Post, Get, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get()
  @ApiOperation({ summary: 'List uploaded files' })
  async listFiles() {
    return this.uploadsService.findAll();
  }

  @Post('presigned-url')
  @ApiOperation({ summary: 'Generate direct upload presigned URL' })
  async getPresignedUrl() {
    return this.uploadsService.generatePresignedUrl();
  }
}
`;
  }

  private static generateUploadsServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UploadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.uploadedFile.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async generatePresignedUrl() {
    const fileId = \`file_\${Date.now()}\`;
    return {
      uploadUrl: \`https://storage.nirmaanify.local/uploads/\${fileId}\`,
      fileKey: fileId,
      expiresInSeconds: 900,
    };
  }
}
`;
  }

  private static generateUsersControllerCode(mod: BackendModuleConfig): string {
    return `import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all users (Admin only)' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user profile by ID' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }
}
`;
  }

  private static generateUsersServiceCode(mod: BackendModuleConfig): string {
    return `import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: { id: true, email: true, name: true, role: true },
    });
  }
}
`;
  }

  // ==========================================
  // ROOT APP & CONFIG GENERATORS
  // ==========================================

  private static generateAppModule(
    enabledModules: BackendModuleConfig[],
    schema: ProjectBackendSchema
  ): string {
    const imports: string[] = ["ConfigModule.forRoot({ isGlobal: true })", 'PrismaModule'];
    const importStatements: string[] = [
      "import { Module } from '@nestjs/common';",
      "import { ConfigModule } from '@nestjs/config';",
      "import { PrismaModule } from './prisma/prisma.module';",
    ];

    for (const mod of enabledModules) {
      const pascal = mod.id.charAt(0).toUpperCase() + mod.id.slice(1);
      importStatements.push(
        `import { ${pascal}Module } from './modules/${mod.id}/${mod.id}.module';`
      );
      imports.push(`${pascal}Module`);
    }

    return `${importStatements.join('\n')}

@Module({
  imports: [
    ${imports.join(',\n    ')},
  ],
})
export class AppModule {}
`;
  }

  private static generateMainTs(schema: ProjectBackendSchema): string {
    const port = schema.settings.port;
    const prefix = schema.settings.globalPrefix.replace(/^\//, '');

    return `import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global Route Prefix
  app.setGlobalPrefix('${prefix}');

  // Enable CORS
  app.enableCors({
    origin: '${schema.settings.corsOrigin}',
    credentials: true,
  });

  // Global Validation Pipe (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Nirmaanify NestJS REST API')
    .setDescription('Production REST API generated by Nirmaanify AI Full-Stack Platform Engine')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || ${port};
  await app.listen(port);
  console.log(\`🚀 NestJS Application listening at: http://localhost:\${port}/${prefix}\`);
  console.log(\`📖 Interactive Swagger API Docs: http://localhost:\${port}/api/docs\`);
}

bootstrap();
`;
  }

  private static generatePrismaSchema(
    enabledModules: BackendModuleConfig[],
    schema: ProjectBackendSchema
  ): string {
    const hasProducts = enabledModules.some((m) => m.id === 'products');
    const hasCategories = enabledModules.some((m) => m.id === 'categories');
    const hasOrders = enabledModules.some((m) => m.id === 'orders');
    const hasPayments = enabledModules.some((m) => m.id === 'payments');
    const hasBlog = enabledModules.some((m) => m.id === 'blog');
    const hasNotifications = enabledModules.some((m) => m.id === 'notifications');
    const hasUploads = enabledModules.some((m) => m.id === 'uploads');

    let schemaContent = `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum UserRole {
  ADMIN
  EDITOR
  MEMBER
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String?
  name      String
  role      UserRole @default(MEMBER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
`;

    if (hasOrders) {
      schemaContent += `  orders    Order[]\n`;
    }
    if (hasBlog) {
      schemaContent += `  blogPosts BlogPost[]\n`;
    }
    if (hasNotifications) {
      schemaContent += `  notifications Notification[]\n`;
    }

    schemaContent += `  @@map("users")
}
`;

    if (hasCategories) {
      schemaContent += `
model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  parentId    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
`;
      if (hasProducts) {
        schemaContent += `  products    Product[]\n`;
      }
      schemaContent += `  @@map("categories")
}
`;
    }

    if (hasProducts) {
      schemaContent += `
model Product {
  id          String    @id @default(uuid())
  title       String
  slug        String    @unique
  description String?
  price       Float
  stock       Int       @default(0)
  imageUrl    String?
  categoryId  String?
`;
      if (hasCategories) {
        schemaContent += `  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)\n`;
      }
      schemaContent += `  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@map("products")
}
`;
    }

    if (hasOrders) {
      schemaContent += `
model Order {
  id              String    @id @default(uuid())
  userId          String
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  totalAmount     Float
  status          String    @default("PENDING")
  shippingAddress Json?
  items           Json
`;
      if (hasPayments) {
        schemaContent += `  payments        Payment[]\n`;
      }
      schemaContent += `  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  @@map("orders")
}
`;
    }

    if (hasPayments) {
      schemaContent += `
model Payment {
  id            String   @id @default(uuid())
  orderId       String
`;
      if (hasOrders) {
        schemaContent += `  order         Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n`;
      }
      schemaContent += `  amount        Float
  currency      String   @default("usd")
  provider      String   @default("stripe")
  transactionId String?
  status        String   @default("PENDING")
  createdAt     DateTime @default(now())

  @@map("payments")
}
`;
    }

    if (hasBlog) {
      schemaContent += `
model BlogPost {
  id         String   @id @default(uuid())
  title      String
  slug       String   @unique
  content    String   @db.Text
  excerpt    String?
  coverImage String?
  published  Boolean  @default(false)
  authorId   String
  author     User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@map("blog_posts")
}
`;
    }

    if (hasNotifications) {
      schemaContent += `
model Notification {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title     String
  message   String
  read      Boolean  @default(false)
  link      String?
  createdAt DateTime @default(now())

  @@map("notifications")
}
`;
    }

    if (hasUploads) {
      schemaContent += `
model UploadedFile {
  id           String   @id @default(uuid())
  filename     String
  originalName String
  mimeType     String
  size         Int
  url          String
  uploadedById String?
  createdAt    DateTime @default(now())

  @@map("uploaded_files")
}
`;
    }

    return schemaContent;
  }

  private static generatePrismaService(): string {
    return `import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
`;
  }

  private static generatePrismaModule(): string {
    return `import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
`;
  }

  private static generateJwtGuard(): string {
    return `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
`;
  }

  private static generateRolesGuard(): string {
    return `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }
}
`;
  }

  private static generateRolesDecorator(): string {
    return `import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
`;
  }

  private static generateCurrentUserDecorator(): string {
    return `import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data && request.user) {
      return request.user[data];
    }
    return request.user;
  },
);
`;
  }

  private static generatePackageJson(projectName: string): string {
    return JSON.stringify(
      {
        name: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-backend`,
        version: '1.0.0',
        description: `NestJS 11 backend generated by Nirmaanify AI for ${projectName}`,
        scripts: {
          build: 'nest build',
          start: 'nest start',
          'start:dev': 'nest start --watch',
          'start:prod': 'node dist/main',
          'prisma:generate': 'prisma generate',
          'prisma:migrate': 'prisma migrate dev',
          'prisma:studio': 'prisma studio',
        },
        dependencies: {
          '@nestjs/common': '^11.0.1',
          '@nestjs/config': '^4.0.0',
          '@nestjs/core': '^11.0.1',
          '@nestjs/jwt': '^11.0.0',
          '@nestjs/passport': '^11.0.4',
          '@nestjs/platform-express': '^11.0.1',
          '@nestjs/swagger': '^11.0.3',
          '@prisma/client': '^6.2.1',
          bcrypt: '^5.1.1',
          'class-transformer': '^0.5.1',
          'class-validator': '^0.14.1',
          passport: '^0.7.0',
          'passport-jwt': '^4.0.1',
          reflect_metadata: '^0.2.2',
          rxjs: '^7.8.1',
        },
        devDependencies: {
          '@nestjs/cli': '^11.0.1',
          '@nestjs/schematics': '^11.0.1',
          '@types/bcrypt': '^5.0.2',
          '@types/express': '^5.0.0',
          '@types/node': '^22.10.7',
          '@types/passport-jwt': '^4.0.1',
          prisma: '^6.2.1',
          typescript: '^5.7.3',
        },
      },
      null,
      2
    );
  }

  private static generateTsConfig(): string {
    return JSON.stringify(
      {
        compilerOptions: {
          module: 'commonjs',
          declaration: true,
          removeComments: true,
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          allowSyntheticDefaultImports: true,
          target: 'ES2022',
          sourceMap: true,
          outDir: './dist',
          baseUrl: './',
          incremental: true,
          skipLibCheck: true,
          strictNullChecks: false,
          noImplicitAny: false,
          strictBindCallApply: false,
          forceConsistentCasingInFileNames: false,
          noFallthroughCasesInSwitch: false,
        },
      },
      null,
      2
    );
  }

  private static generateNestCliJson(): string {
    return JSON.stringify(
      {
        $schema: 'https://json.schemastore.org/nest-cli',
        collection: '@nestjs/schematics',
        sourceRoot: 'src',
        compilerOptions: {
          deleteOutDir: true,
        },
      },
      null,
      2
    );
  }

  private static generateEnvFile(schema: ProjectBackendSchema): string {
    const s = schema.settings;
    return `# NestJS Server Environment Configuration
PORT=${s.port}
NODE_ENV=development
API_PREFIX=${s.globalPrefix}

# PostgreSQL Database Connection
DATABASE_URL="${s.databaseUrl}"

# JWT Authentication
JWT_SECRET="${s.jwtSecret}"
JWT_EXPIRATION="${s.jwtExpiration}"

# Security & CORS
CORS_ORIGIN="${s.corsOrigin}"
`;
  }

  private static generateDockerCompose(projectName: string, port: number): string {
    return `version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: project_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  pgdata:
`;
  }

  private static generateReadme(projectName: string, schema: ProjectBackendSchema): string {
    const s = schema.settings;
    const prefix = s.globalPrefix;
    return `# ${projectName} — NestJS 11 Enterprise REST Backend

Generated automatically by **Nirmaanify AI Full-Stack Platform Engine**.

## 🚀 Quickstart

### 1. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 2. Start PostgreSQL Database
\`\`\`bash
docker-compose up -d
\`\`\`

### 3. Run Prisma Database Migrations
\`\`\`bash
npx prisma db push
\`\`\`

### 4. Start NestJS Development Server
\`\`\`bash
npm run start:dev
\`\`\`

- **REST API Base**: [http://localhost:${s.port}/${prefix}](http://localhost:${s.port}/${prefix})
- **Interactive Swagger Docs**: [http://localhost:${s.port}/api/docs](http://localhost:${s.port}/api/docs)
`;
  }

  private static generateFrontendApiClient(
    enabledModules: BackendModuleConfig[],
    schema: ProjectBackendSchema
  ): string {
    const prefix = schema.settings.globalPrefix.replace(/^\//, '');
    const hasAuth = enabledModules.some((m) => m.id === 'auth');
    const hasProducts = enabledModules.some((m) => m.id === 'products');
    const hasOrders = enabledModules.some((m) => m.id === 'orders');

    return `/**
 * Generated TypeScript API Client for Next.js 15 Frontend
 * Connects frontend visual components directly to your NestJS Backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:${schema.settings.port}/${prefix}';

export class ProjectApiClient {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  private static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as any),
    };

    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }

    const response = await fetch(\`\${API_BASE}\${endpoint}\`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || \`API request failed with status \${response.status}\`);
    }

    return response.json();
  }

${
  hasAuth
    ? `  // Authentication
  static auth = {
    register: (data: { email: string; password: string; name: string }) =>
      ProjectApiClient.request<{ user: any; accessToken: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      ProjectApiClient.request<{ user: any; accessToken: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getProfile: () => ProjectApiClient.request<any>('/auth/me'),
  };
`
    : ''
}${
  hasProducts
    ? `  // Products Catalog
  static products = {
    list: (params?: { search?: string; categoryId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return ProjectApiClient.request<any[]>(\`/products\${query ? '?' + query : ''}\`);
    },
    get: (id: string) => ProjectApiClient.request<any>(\`/products/\${id}\`),
  };
`
    : ''
}${
  hasOrders
    ? `  // Orders
  static orders = {
    list: () => ProjectApiClient.request<any[]>('/orders'),
    create: (data: { totalAmount: number; items: any[]; shippingAddress?: any }) =>
      ProjectApiClient.request<any>('/orders', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  };
`
    : ''
}}
`;
  }
}
