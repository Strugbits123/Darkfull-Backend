/*
  Warnings:

  - You are about to drop the `user_permission_mappings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."user_permission_mappings" DROP CONSTRAINT "user_permission_mappings_permission_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_permission_mappings" DROP CONSTRAINT "user_permission_mappings_user_id_fkey";

-- DropTable
DROP TABLE "public"."user_permission_mappings";
