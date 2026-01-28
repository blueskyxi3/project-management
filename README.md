<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1wBW1EJiYXxS09L1P-z_AaCoHTXOD0OWf

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

# 
该项目为纯前端react项目，请识别前端的功能逻辑，基于supabase生成后端逻辑，要求如下：
1. 识别前端页面中所有的功能，包括但不限于用户登录、注册、项目管理等。
2. 项目编辑页面，只需要处理overview与strategy页签对应的后端代码。
3. 当点击新建项目时，弹出项目上传界面，该界面需对接后端代码。
4. 后端采取supabase作为数据库，请根据前端代码生成对应的数据库表结构。其中项目表参考表的mysql结构如下，请用postgres语法做相应的语法变更：

```sql
CREATE TABLE project_info (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    project_no VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目编号',
    project_title VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目名称',
    project_summary VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目总结',
    project_url VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目文件link',
    project_file VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目文件名',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',  
    -- 可选：添加唯一约束（如果需要）
    UNIQUE KEY uk_project_no (project_no)
    -- 添加备注
    COMMENT '项目信息表'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
CREATE TABLE project_direct_info (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    project_no VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目编号',
    strategy_fit VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '项目策略',
    demand_urgency VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '需求紧急程度',
    bottleneck VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '瓶颈',
    product_and_edge VARCHAR(1400) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '产品边界',
    trl VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  COMMENT '成熟度',
    resources VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '资源',  
    supporting_materials_present VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '支撑材料情况',   
    information_completeness_note VARCHAR(800) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci  COMMENT '信息完整性说明',   
    ai_directional_signal VARCHAR(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '方向性信号',   
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',  
    -- 可选：添加唯一约束（如果需要）
    UNIQUE KEY uk_project_no (project_no)
    -- 添加备注
    COMMENT '项目方向策略表'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;
```
Q8dsUdYXAVCIVmNs

