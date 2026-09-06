import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class ShopService {
  private get client() {
    return getSupabaseClient();
  }

  async getConfig() {
    const { data, error } = await this.client
      .from('shop_config')
      .select('key, value');
    if (error) throw new Error(`查询店铺配置失败: ${error.message}`);
    const config: Record<string, string> = {};
    (data || []).forEach(item => {
      config[item.key] = item.value || '';
    });
    return config;
  }
}
