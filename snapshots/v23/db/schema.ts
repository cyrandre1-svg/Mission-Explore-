import {sqliteTable,text,integer,real,index} from 'drizzle-orm/sqlite-core';
export const communityRoutes=sqliteTable('community_routes',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),author:text('author').notNull(),publisherType:text('publisher_type').notNull(),name:text('name').notNull(),sport:text('sport').notNull(),description:text('description').notNull(),color:text('color').notNull(),geometry:text('geometry').notNull(),distance:real('distance').notNull(),createdAt:integer('created_at').notNull(),
},t=>[index('routes_owner_idx').on(t.ownerId),index('routes_created_idx').on(t.createdAt)]);
export const routeReports=sqliteTable('route_reports',{id:text('id').primaryKey(),routeId:text('route_id').notNull(),reporterId:text('reporter_id').notNull(),reason:text('reason').notNull(),createdAt:integer('created_at').notNull()});
export const missionProjects=sqliteTable('mission_projects',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),kind:text('kind').notNull(),name:text('name').notNull(),payload:text('payload').notNull(),updatedAt:integer('updated_at').notNull(),
},t=>[index('projects_owner_idx').on(t.ownerId)]);
