import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default roles
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super-admin' },
    update: {},
    create: {
      name: 'super-admin',
      displayName: 'Super Administrator',
      description: 'Full system access and control',
      isSystem: true,
    },
  });

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      displayName: 'Administrator',
      description: 'Administrative access to manage users and system settings',
      isSystem: true,
    },
  });

  const merchantRole = await prisma.role.upsert({
    where: { name: 'merchant' },
    update: {},
    create: {
      name: 'merchant',
      displayName: 'Merchant',
      description: 'Merchant access to manage their own store and orders',
      isSystem: true,
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {},
    create: {
      name: 'user',
      displayName: 'User',
      description: 'Basic user access',
      isSystem: true,
    },
  });

  // Create default permissions
  const permissions = [
    // User management
    { name: 'user:create', displayName: 'Create Users', resource: 'user', action: 'create' },
    { name: 'user:read', displayName: 'Read Users', resource: 'user', action: 'read' },
    { name: 'user:update', displayName: 'Update Users', resource: 'user', action: 'update' },
    { name: 'user:delete', displayName: 'Delete Users', resource: 'user', action: 'delete' },
    
    // Role management
    { name: 'role:create', displayName: 'Create Roles', resource: 'role', action: 'create' },
    { name: 'role:read', displayName: 'Read Roles', resource: 'role', action: 'read' },
    { name: 'role:update', displayName: 'Update Roles', resource: 'role', action: 'update' },
    { name: 'role:delete', displayName: 'Delete Roles', resource: 'role', action: 'delete' },
    
    // Order management
    { name: 'order:create', displayName: 'Create Orders', resource: 'order', action: 'create' },
    { name: 'order:read', displayName: 'Read Orders', resource: 'order', action: 'read' },
    { name: 'order:update', displayName: 'Update Orders', resource: 'order', action: 'update' },
    { name: 'order:delete', displayName: 'Delete Orders', resource: 'order', action: 'delete' },
    
    // Inventory management
    { name: 'inventory:create', displayName: 'Create Inventory', resource: 'inventory', action: 'create' },
    { name: 'inventory:read', displayName: 'Read Inventory', resource: 'inventory', action: 'read' },
    { name: 'inventory:update', displayName: 'Update Inventory', resource: 'inventory', action: 'update' },
    { name: 'inventory:delete', displayName: 'Delete Inventory', resource: 'inventory', action: 'delete' },
    
    // System settings
    { name: 'system:read', displayName: 'Read System Settings', resource: 'system', action: 'read' },
    { name: 'system:update', displayName: 'Update System Settings', resource: 'system', action: 'update' },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // Assign permissions to roles
  const superAdminPermissions = await prisma.permission.findMany();
  const adminPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'user' },
        { resource: 'role' },
        { resource: 'order' },
        { resource: 'inventory' },
      ],
    },
  });

  const merchantPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'order', action: { in: ['create', 'read', 'update'] } },
        { resource: 'inventory', action: { in: ['read', 'update'] } },
      ],
    },
  });

  const userPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'order', action: 'read' },
        { resource: 'inventory', action: 'read' },
      ],
    },
  });

  // Create role-permission mappings
  for (const permission of superAdminPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: superAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  for (const permission of adminPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  for (const permission of merchantPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: merchantRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: merchantRole.id,
        permissionId: permission.id,
      },
    });
  }

  for (const permission of userPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create default super admin user
  const hashedPassword = await bcrypt.hash('superadmin123', 12);
  
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@darkhorse3pl.com' },
    update: {},
    create: {
      email: 'admin@darkhorse3pl.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      status: 'ACTIVE',
      role: 'SUPER_ADMIN',
      emailVerified: true,
      emailVerifiedAt: new Date(),
    },
  });

  // Assign super admin role to user
  await prisma.userRoleMapping.upsert({
    where: {
      userId_roleId: {
        userId: superAdminUser.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: superAdminUser.id,
      roleId: superAdminRole.id,
    },
  });

  // Create system configurations
  const configs = [
    { key: 'PLATFORM_NAME', value: 'Dark Horse 3PL Platform', description: 'Platform display name' },
    { key: 'PLATFORM_VERSION', value: '1.0.0', description: 'Current platform version' },
    { key: 'MAX_LOGIN_ATTEMPTS', value: '5', description: 'Maximum login attempts before lockout' },
    { key: 'SESSION_TIMEOUT', value: '1440', description: 'Session timeout in minutes' },
    { key: 'OTP_EXPIRY_MINUTES', value: '10', description: 'OTP expiry time in minutes' },
    { key: 'PASSWORD_MIN_LENGTH', value: '8', description: 'Minimum password length' },
  ];

  for (const config of configs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {},
      create: config,
    });
  }

  // Create notification templates
  const templates = [
    {
      name: 'USER_REGISTRATION',
      type: 'EMAIL',
      subject: 'Welcome to Dark Horse 3PL Platform',
      content: 'Welcome {{firstName}}! Your account has been created successfully. Please verify your email using the OTP: {{otp}}',
      variables: { firstName: 'string', otp: 'string' },
    },
    {
      name: 'PASSWORD_RESET',
      type: 'EMAIL',
      subject: 'Password Reset Request',
      content: 'Hello {{firstName}}, You requested a password reset. Use this OTP to reset your password: {{otp}}',
      variables: { firstName: 'string', otp: 'string' },
    },
    {
      name: 'ORDER_CREATED',
      type: 'EMAIL',
      subject: 'Order Confirmation - {{orderNumber}}',
      content: 'Your order {{orderNumber}} has been successfully created and is being processed.',
      variables: { orderNumber: 'string' },
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: {
        ...template,
        type: template.type as any,
        variables: template.variables as any,
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📧 Super Admin: admin@darkhorse3pl.com / superadmin123`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });