import { EntityManager } from 'typeorm';

// Mọi transaction đổi cha dùng cùng khóa để lần lượt kiểm tra, tránh tạo vòng lặp.
// PostgreSQL tự giải phóng khóa khi transaction kết thúc.
export async function lockCategoryTree(manager: EntityManager): Promise<void> {
  const categoryTreeLockNamespace = 1138357321;
  const categoryTreeLockId = 1;
  await manager.query('SELECT pg_advisory_xact_lock($1, $2)', [categoryTreeLockNamespace, categoryTreeLockId]);
}
