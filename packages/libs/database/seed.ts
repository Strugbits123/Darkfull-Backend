import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default roles based on auth flow hierarchy
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'super-admin' },
    update: {},
    create: {
      name: 'super-admin',
      displayName: 'Super Administrator',
      description: 'Platform oversight, creates stores and invites store admins',
      isSystem: true,
    },
  });

  const storeAdminRole = await prisma.role.upsert({
    where: { name: 'store-admin' },
    update: {},
    create: {
      name: 'store-admin',
      displayName: 'Store Administrator',
      description: 'Store operations, Salla integration, invites directors',
      isSystem: true,
    },
  });

  const directorRole = await prisma.role.upsert({
    where: { name: 'director' },
    update: {},
    create: {
      name: 'director',
      displayName: 'Director',
      description: 'Multi-warehouse oversight, invites managers',
      isSystem: true,
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      displayName: 'Warehouse Manager',
      description: 'Single warehouse operations, invites workers',
      isSystem: true,
    },
  });

  const receiverRole = await prisma.role.upsert({
    where: { name: 'receiver' },
    update: {},
    create: {
      name: 'receiver',
      displayName: 'Receiver',
      description: 'Incoming inventory management',
      isSystem: true,
    },
  });

  const pickerRole = await prisma.role.upsert({
    where: { name: 'picker' },
    update: {},
    create: {
      name: 'picker',
      displayName: 'Picker',
      description: 'Order picking operations',
      isSystem: true,
    },
  });

  const packerRole = await prisma.role.upsert({
    where: { name: 'packer' },
    update: {},
    create: {
      name: 'packer',
      displayName: 'Packer',
      description: 'Order packing operations',
      isSystem: true,
    },
  });

  const shipperRole = await prisma.role.upsert({
    where: { name: 'shipper' },
    update: {},
    create: {
      name: 'shipper',
      displayName: 'Shipper',
      description: 'Order shipping operations',
      isSystem: true,
    },
  });

  // Create permissions based on auth flow hierarchy
  const permissions = [
    // Store management (Super Admin only)
    { name: 'store:create', displayName: 'Create Stores', resource: 'store', action: 'create' },
    { name: 'store:read', displayName: 'Read Stores', resource: 'store', action: 'read' },
    { name: 'store:update', displayName: 'Update Stores', resource: 'store', action: 'update' },
    { name: 'store:delete', displayName: 'Delete Stores', resource: 'store', action: 'delete' },
    
    // User management (hierarchical)
    { name: 'user:invite', displayName: 'Invite Users', resource: 'user', action: 'invite' },
    { name: 'user:read', displayName: 'Read Users', resource: 'user', action: 'read' },
    { name: 'user:update', displayName: 'Update Users', resource: 'user', action: 'update' },
    { name: 'user:deactivate', displayName: 'Deactivate Users', resource: 'user', action: 'deactivate' },
    
    // Warehouse management
    { name: 'warehouse:create', displayName: 'Create Warehouses', resource: 'warehouse', action: 'create' },
    { name: 'warehouse:read', displayName: 'Read Warehouses', resource: 'warehouse', action: 'read' },
    { name: 'warehouse:update', displayName: 'Update Warehouses', resource: 'warehouse', action: 'update' },
    { name: 'warehouse:delete', displayName: 'Delete Warehouses', resource: 'warehouse', action: 'delete' },
    
    // Salla integration (Store Admin)
    { name: 'salla:connect', displayName: 'Connect Salla Store', resource: 'salla', action: 'connect' },
    { name: 'salla:sync', displayName: 'Sync Salla Data', resource: 'salla', action: 'sync' },
    { name: 'salla:disconnect', displayName: 'Disconnect Salla Store', resource: 'salla', action: 'disconnect' },
    
    // Order management
    { name: 'order:create', displayName: 'Create Orders', resource: 'order', action: 'create' },
    { name: 'order:read', displayName: 'Read Orders', resource: 'order', action: 'read' },
    { name: 'order:update', displayName: 'Update Orders', resource: 'order', action: 'update' },
    { name: 'order:process', displayName: 'Process Orders', resource: 'order', action: 'process' },
    
    // Inventory management
    { name: 'inventory:receive', displayName: 'Receive Inventory', resource: 'inventory', action: 'receive' },
    { name: 'inventory:read', displayName: 'Read Inventory', resource: 'inventory', action: 'read' },
    { name: 'inventory:update', displayName: 'Update Inventory', resource: 'inventory', action: 'update' },
    { name: 'inventory:adjust', displayName: 'Adjust Inventory', resource: 'inventory', action: 'adjust' },
    
    // Warehouse operations
    { name: 'operation:pick', displayName: 'Pick Orders', resource: 'operation', action: 'pick' },
    { name: 'operation:pack', displayName: 'Pack Orders', resource: 'operation', action: 'pack' },
    { name: 'operation:ship', displayName: 'Ship Orders', resource: 'operation', action: 'ship' },
    
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

  // Assign permissions to roles based on hierarchy
  const superAdminPermissions = await prisma.permission.findMany();
  
  const storeAdminPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'user', action: 'invite' },
        { resource: 'user', action: 'read' },
        { resource: 'user', action: 'update' },
        { resource: 'warehouse' },
        { resource: 'salla' },
        { resource: 'order' },
        { resource: 'inventory' },
      ],
    },
  });

  const directorPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'user', action: 'invite' },
        { resource: 'user', action: 'read' },
        { resource: 'warehouse', action: { in: ['read', 'update'] } },
        { resource: 'order' },
        { resource: 'inventory' },
      ],
    },
  });

  const managerPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'user', action: 'invite' },
        { resource: 'user', action: 'read' },
        { resource: 'warehouse', action: 'read' },
        { resource: 'order' },
        { resource: 'inventory' },
        { resource: 'operation' },
      ],
    },
  });

  const workerPermissions = await prisma.permission.findMany({
    where: {
      OR: [
        { resource: 'order', action: { in: ['read', 'process'] } },
        { resource: 'inventory', action: { in: ['read', 'receive', 'update'] } },
      ],
    },
  });

  // Create role-permission mappings for Super Admin (all permissions)
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

  // Create role-permission mappings for Store Admin
  for (const permission of storeAdminPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: storeAdminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: storeAdminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create role-permission mappings for Director
  for (const permission of directorPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: directorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: directorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create role-permission mappings for Manager
  for (const permission of managerPermissions) {
    await prisma.rolePermissionMapping.upsert({
      where: {
        roleId_permissionId: {
          roleId: managerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: managerRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Create role-permission mappings for all worker roles
  const workerRoles = [receiverRole, pickerRole, packerRole, shipperRole];
  for (const role of workerRoles) {
    for (const permission of workerPermissions) {
      await prisma.rolePermissionMapping.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
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

  // Create notification templates for auth flow
  const templates = [
    {
      name: 'STORE_ADMIN_INVITATION',
      type: 'EMAIL' as const,
      subject: 'Invitation to Dark Horse 3PL Platform - Store Admin',
      content: 'Hello {{firstName}}, You have been invited as a Store Admin for {{storeName}}. Click the link to accept: {{invitationLink}}',
      variables: { firstName: 'string', storeName: 'string', invitationLink: 'string' },
    },
    {
      name: 'DIRECTOR_INVITATION',
      type: 'EMAIL' as const,
      subject: 'Invitation to Dark Horse 3PL Platform - Director',
      content: 'Hello {{firstName}}, You have been invited as a Director. Click the link to accept: {{invitationLink}}',
      variables: { firstName: 'string', invitationLink: 'string' },
    },
    {
      name: 'MANAGER_INVITATION',
      type: 'EMAIL' as const,
      subject: 'Invitation to Dark Horse 3PL Platform - Manager',
      content: 'Hello {{firstName}}, You have been invited as a Warehouse Manager for {{warehouseName}}. Click the link to accept: {{invitationLink}}',
      variables: { firstName: 'string', warehouseName: 'string', invitationLink: 'string' },
    },
    {
      name: 'WORKER_INVITATION',
      type: 'EMAIL' as const,
      subject: 'Invitation to Dark Horse 3PL Platform - {{role}}',
      content: 'Hello {{firstName}}, You have been invited as a {{role}} at {{warehouseName}}. Click the link to accept: {{invitationLink}}',
      variables: { firstName: 'string', role: 'string', warehouseName: 'string', invitationLink: 'string' },
    },
    {
      name: 'SALLA_CONNECTION_SUCCESS',
      type: 'EMAIL' as const,
      subject: 'Salla Store Connected Successfully',
      content: 'Congratulations {{firstName}}! Your Salla store {{storeName}} has been successfully connected to Dark Horse 3PL Platform.',
      variables: { firstName: 'string', storeName: 'string' },
    },
  ];

  for (const template of templates) {
    await prisma.notificationTemplate.upsert({
      where: { name: template.name },
      update: {},
      create: {
        name: template.name,
        type: template.type,
        subject: template.subject,
        content: template.content,
        variables: template.variables,
      },
    });
  }

  console.log('✅ Database seeding completed successfully!');
  console.log(`📧 Super Admin: admin@darkhorse3pl.com / superadmin123`);
  console.log('🏪 Auth Flow Hierarchy:');
  console.log('   Super Admin → Creates Stores → Invites Store Admins');
  console.log('   Store Admin → Connects Salla → Invites Directors');
  console.log('   Directors → Invite Managers');
  console.log('   Managers → Invite Workers (Receiver, Picker, Packer, Shipper)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });