/*
  Warnings:

  - The `salla_access_token_expire_at` column on the `stores` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."stores" ADD COLUMN     "salla_state" TEXT,
DROP COLUMN "salla_access_token_expire_at",
ADD COLUMN     "salla_access_token_expire_at" TIMESTAMP(3);
