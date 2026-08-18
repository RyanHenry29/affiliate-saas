import { SetMetadata } from '@nestjs/common';
export const IS_ADMIN_MASTER_KEY = 'isAdminMaster';
export const AdminMasterOnly = () => SetMetadata(IS_ADMIN_MASTER_KEY, true);
