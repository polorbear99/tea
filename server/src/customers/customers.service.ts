import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

@Injectable()
export class CustomersService {
  private get client() {
    return getSupabaseClient();
  }

  async findOrCreate(openId: string, unionId?: string, nickname?: string, avatarUrl?: string) {
    // Try to find existing customer
    const { data: existing } = await this.client
      .from('customers')
      .select('*')
      .eq('open_id', openId)
      .maybeSingle();

    if (existing) {
      // Update info if changed
      if (nickname || avatarUrl) {
        const updateData: Record<string, string> = {};
        if (nickname) updateData.nickname = nickname;
        if (avatarUrl) updateData.avatar_url = avatarUrl;
        await this.client
          .from('customers')
          .update(updateData)
          .eq('id', existing.id);
      }
      return existing;
    }

    // Create new customer
    const { data: customer, error } = await this.client
      .from('customers')
      .insert({
        open_id: openId,
        union_id: unionId,
        nickname: nickname || `茶友${Math.floor(Math.random() * 10000)}`,
        avatar_url: avatarUrl,
      })
      .select()
      .single();
    if (error) throw new Error(`创建用户失败: ${error.message}`);
    return customer;
  }

  async findById(id: string) {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw new Error(`查询用户失败: ${error.message}`);
    return data;
  }
}
