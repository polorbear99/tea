import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class CategoriesService {
  private get client() {
    return getSupabaseClient();
  }

  async findAll() {
    const { data, error } = await this.client
      .from('product_categories')
      .select('*')
      .order('sort_order');
    if (error) throw new Error(`查询分类失败: ${error.message}`);
    return data || [];
  }
}
