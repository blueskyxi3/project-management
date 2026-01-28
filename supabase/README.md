# ProjectManager  - Supabase Backend

这是 ProjectManager  项目的 Supabase 后端实现。

## 目录结构

```
supabase/
├── schema.sql           # 数据库架构定义（PostgreSQL）
├── client.ts            # Supabase 客户端配置
├── types.ts             # TypeScript 类型定义
├── services/
│   ├── authService.ts    # 认证服务（登录、注册、用户管理）
│   └── projectService.ts # 项目服务（CRUD、文件上传等）
└── README.md           # 本文件
```

## 功能概述

### 1. 认证功能 (authService.ts)

| 功能 | 说明 |
|-----|------|
| `signup` | 用户注册 |
| `login` | 邮箱密码登录 |
| `loginWithOAuth` | SSO 登录（支持 Google、GitHub、Azure、Authelia） |
| `logout` | 登出 |
| `resetPassword` | 发送密码重置邮件 |
| `changePassword` | 更新密码 |
| `getProfile` | 获取用户资料 |
| `updateProfile` | 更新用户资料 |
| `uploadAvatar` | 上传用户头像 |

### 2. 项目管理功能 (projectService.ts)

#### 项目信息（Overview 页签）

| 功能 | 说明 |
|-----|------|
| `getProjects` | 获取项目列表（支持分页、搜索、筛选） |
| `getProjectById` | 根据 ID 获取项目详情 |
| `getProjectByNo` | 根据项目编号获取项目详情 |
| `createProject` | 创建新项目 |
| `updateProjectOverview` | 更新项目概览信息 |
| `updateProjectStatus` | 更新项目状态 |
| `deleteProject` | 删除项目 |

#### 项目策略（Strategy 页签）

| 功能 | 说明 |
|-----|------|
| `getProjectDirectInfo` | 获取项目策略信息 |
| `upsertProjectDirectInfo` | 创建或更新项目策略信息 |
| `updateProjectStrategy` | 更新项目策略 |

#### 项目文件

| 功能 | 说明 |
|-----|------|
| `getProjectFiles` | 获取项目文件列表 |
| `uploadProjectFile` | 上传单个文件 |
| `uploadProjectFiles` | 批量上传文件 |
| `deleteProjectFile` | 删除文件 |
| `downloadProjectFile` | 下载文件 |

### 3. 实时订阅

| 功能 | 说明 |
|-----|------|
| `subscribeToProject` | 订阅项目变更 |
| `subscribeToProjectFiles` | 订阅项目文件变更 |

## 数据库表结构

### profiles
用户资料表（扩展 Supabase Auth）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 用户 ID（关联 auth.users） |
| email | TEXT | 邮箱 |
| full_name | TEXT | 全名 |
| avatar_url | TEXT | 头像 URL |
| role | TEXT | 角色（Admin/Manager/Member） |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### project_info
项目信息表（对应 Overview 页签）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 项目 ID |
| project_no | VARCHAR(40) | 项目编号（唯一） |
| project_title | VARCHAR(800) | 项目名称 |
| project_summary | VARCHAR(800) | 项目总结 |
| project_url | VARCHAR(800) | 项目文件链接 |
| project_file | VARCHAR(800) | 项目文件名 |
| status | VARCHAR(20) | 状态（In Progress/Completed/Upcoming/Pending） |
| creator_id | UUID | 创建者 ID |
| files_count | INTEGER | 文件数量 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### project_direct_info
项目方向策略表（对应 Strategy 页签）

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 记录 ID |
| project_id | UUID | 关联项目 ID |
| project_no | VARCHAR(40) | 项目编号（唯一） |
| strategy_fit | VARCHAR(40) | 项目策略（National Strategy/Group Strategy/Subsidiary Direction） |
| demand_urgency | VARCHAR(800) | 需求紧急程度 |
| bottleneck | VARCHAR(800) | 瓶颈 |
| product_and_edge | VARCHAR(1400) | 产品边界 |
| trl | VARCHAR(800) | 成熟度 |
| resources | VARCHAR(800) | 资源 |
| supporting_materials_present | VARCHAR(800) | 支撑材料情况 |
| information_completeness_note | VARCHAR(800) | 信息完整性说明 |
| ai_directional_signal | VARCHAR(40) | 方向性信号（CONTINUE/NEED_MORE_INFO/RISK_ALERT） |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

### project_files
项目文件表

| 字段 | 类型 | 说明 |
|-----|------|------|
| id | UUID | 文件 ID |
| project_id | UUID | 关联项目 ID |
| file_name | VARCHAR(500) | 文件名 |
| file_path | TEXT | 存储路径 |
| file_url | TEXT | 公共 URL |
| file_size | BIGINT | 文件大小 |
| file_type | VARCHAR(100) | 文件类型 |
| document_category | VARCHAR(100) | 文档类别 |
| uploaded_by | UUID | 上传者 ID |
| mime_type | VARCHAR(100) | MIME 类型 |
| created_at | TIMESTAMPTZ | 创建时间 |
| updated_at | TIMESTAMPTZ | 更新时间 |

## 安装配置

### 1. 安装 Supabase 客户端

```bash
npm install @supabase/supabase-js
```

### 2. 创建 Supabase 项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 获取项目的 URL 和 anon key

### 3. 设置环境变量

在项目根目录创建 `.env.local` 文件：

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. 执行数据库架构

1. 在 Supabase Dashboard 中进入 SQL Editor
2. 复制 `schema.sql` 的全部内容
3. 执行 SQL 脚本

### 5. 创建存储桶（Storage Buckets）

在 Supabase Dashboard 中进入 Storage：

1. 创建 `project-documents` 桶（用于项目文件）
2. 创建 `user-avatars` 桶（用于用户头像）
3. 对 `project-documents` 桶设置：
   - Public: 是（允许公开访问）
   - File size limit: 10MB
   - Allowed MIME types: `image/*`, `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.*`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.*`

### 6. 配置 OAuth 提供商（可选）

如果需要 SSO 登录，在 Supabase Dashboard → Authentication → Providers 中配置：
- Authelia
- Google
- GitHub
- Azure
- Apple

## 使用示例

### 认证服务

```typescript
import authService from '@/supabase/services/authService';

// 用户注册
await authService.signup('user@example.com', 'password123', {
  fullName: 'John Doe'
});

// 用户登录
await authService.login('user@example.com', 'password123');

// SSO 登录
await authService.loginWithOAuth('authelia');

// 登出
await authService.logout();

// 获取当前用户
const { user, profile } = await authService.getCurrentUserWithProfile();

// 更新用户资料
await authService.updateProfile(userId, {
  full_name: 'John Smith'
});

// 重置密码
await authService.resetPassword('user@example.com');
```

### 项目服务

```typescript
import projectService from '@/supabase/services/projectService';

// 获取项目列表
const { projects, total } = await projectService.getProjects({
  keyword: 'marketing',
  status: 'In Progress',
  page: 1,
  perPage: 20
});

// 创建项目
const project = await projectService.createProject({
  project_no: 'PJ-2024-001',
  project_title: 'Q1 Marketing Campaign',
  project_summary: 'New customer acquisition strategy'
});

// 更新项目概览
await projectService.updateProjectOverview(project.id, {
  project_title: 'Q1 Marketing Campaign - Revised',
  project_summary: 'Updated strategy with social media focus'
});

// 更新项目策略
await projectService.updateProjectStrategy(project.id, {
  strategy_fit: 'Group Strategy',
  demand_urgency: 'High priority due to competitor activity',
  product_and_edge: 'AI-powered targeting with 40% better conversion',
  ai_directional_signal: 'CONTINUE'
});

// 上传文件
const file = await projectService.uploadProjectFile(
  project.id,
  fileObject,
  'Project Application'
);

// 获取项目文件
const files = await projectService.getProjectFiles(project.id);

// 删除文件
await projectService.deleteProjectFile(fileId);

// 获取完整项目数据
const completeProject = await projectService.getCompleteProject(project.id);

// 删除项目
await projectService.deleteProject(project.id);
```

### 实时订阅

```typescript
import projectService from '@/supabase/services/projectService';

// 订阅项目变更
const subscription = projectService.subscribeToProject(projectId, (payload) => {
  console.log('Project changed:', payload);
  if (payload.eventType === 'UPDATE') {
    // 处理项目更新
  }
});

// 取消订阅
subscription.unsubscribe();
```

## 权限控制

系统通过 RLS (Row Level Security) 实现权限控制：

| 角色 | 权限 |
|-----|------|
| **Guest** | 仅查看公开信息 |
| **Member** | 查看所有项目、创建项目、编辑自己的项目、上传文件到自己的项目 |
| **Manager** | 同 Member，加上可以编辑下属的项目 |
| **Admin** | 所有权限，包括管理用户 |

## API 错误处理

所有服务函数在出错时会抛出 `Error` 异常：

```typescript
try {
  await projectService.createProject(data);
} catch (error) {
  if (error instanceof Error) {
    console.error('Failed to create project:', error.message);
    // 显示错误提示给用户
  }
}
```

## 存储策略

### 文件存储路径

- 项目文件: `project-documents/{projectId}/{fileName}`
- 用户头像: `user-avatars/{userId}/avatar-{userId}.{ext}`

### 文件上传限制

- 单文件最大: 10MB
- 支持格式: PDF, Word, Excel, PowerPoint, 图片 (JPG, PNG, GIF, WebP)

## 迁移说明

如果从 MySQL 迁移到 Supabase (PostgreSQL)，主要变更：

1. `BIGINT UNSIGNED` → `BIGINT` 或 `UUID`
2. `AUTO_INCREMENT` → `SERIAL` 或使用 `uuid_generate_v4()`
3. `TIMESTAMP DEFAULT CURRENT_TIMESTAMP` → `TIMESTAMPTZ DEFAULT NOW()`
4. `ON UPDATE CURRENT_TIMESTAMP` → 使用触发器实现
5. `CHARACTER SET utf8mb4` → PostgreSQL 默认 UTF-8
6. `COMMENT` → 使用 `COMMENT ON TABLE` 和 `COMMENT ON COLUMN`
