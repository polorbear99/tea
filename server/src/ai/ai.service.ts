import { Injectable } from '@nestjs/common';
import { getSupabaseClient } from '@/storage/database/supabase-client';

async function callLLM(messages: Array<{ role: string; content: any }>, temperature = 0.7): Promise<string> {
  try {
    const sdk = await import('coze-coding-dev-sdk');
    const config = new sdk.Config();
    const client = new sdk.LLMClient(config);
    const response = await client.invoke(messages as any, {
      model: 'doubao-seed-2-0-mini-260215',
      temperature,
    });
    return response.content || '';
  } catch {
    return '';
  }
}

@Injectable()
export class AiService {
  private get client() {
    return getSupabaseClient();
  }

  async chat(body: {
    customer_id?: string;
    product_id?: string;
    message: string;
    conversation_id?: string;
    type?: string;
  }) {
    const { customer_id, product_id, message, conversation_id, type = 'ask_tea' } = body;

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      const { data: conv, error: convError } = await this.client
        .from('ai_conversations')
        .insert({ customer_id, product_id, type, title: message.slice(0, 50) })
        .select()
        .single();
      if (convError) throw new Error(`创建会话失败: ${convError.message}`);
      convId = conv.id;
    }

    // Save user message
    await this.client.from('ai_messages').insert({
      conversation_id: convId,
      role: 'user',
      content: message,
    });

    // Get context: product info + knowledge
    let context = '';
    if (product_id) {
      const { data: product } = await this.client
        .from('products')
        .select('name, tea_type, variety, origin, year, craft, aroma, taste, description, product_brewing(*), product_skus(spec_name, price, stock)')
        .eq('id', product_id)
        .maybeSingle();
      if (product) {
        context += `\n当前商品：${product.name}\n茶类：${product.tea_type}\n品种：${product.variety}\n产地：${product.origin}\n年份：${product.year}\n工艺：${product.craft}\n香型：${product.aroma}\n滋味：${product.taste}\n简介：${product.description}`;
        if ((product as any).product_brewing) {
          const b = (product as any).product_brewing;
          context += `\n冲泡信息：茶具${b.teaware}，投茶量${b.tea_amount}，水量${b.water_amount}，水温${b.water_temp}，冲泡时间${b.brew_time}，推荐泡数${b.recommended_infusions}`;
        }
      }
    }

    // Get knowledge
    const { data: knowledge } = await this.client
      .from('knowledge_documents')
      .select('type, title, content')
      .order('sort_order');
    if (knowledge && knowledge.length > 0) {
      context += '\n\n店铺知识库：';
      knowledge.forEach(k => {
        context += `\n【${k.title}】${k.content}`;
      });
    }

    // Get conversation history
    const { data: history } = await this.client
      .from('ai_messages')
      .select('role, content')
      .eq('conversation_id', convId)
      .order('created_at')
      .limit(10);

    // Get shop config for AI style
    const { data: shopConfigs } = await this.client
      .from('shop_config')
      .select('key, value')
      .in('key', ['ai_advisor_name', 'ai_style', 'brand_name']);
    const configMap: Record<string, string> = {};
    (shopConfigs || []).forEach(c => { configMap[c.key] = c.value || ''; });

    const systemPrompt = `你是${configMap.ai_advisor_name || '茶小茗'}，${configMap.brand_name || '茗香茶庄'}的AI茶艺顾问。
风格：${configMap.ai_style || '温和专业，像一位经验丰富的茶艺师'}。
你需要根据用户的问题和提供的商品信息，给出专业、准确的回答。
重要规则：
1. 不得虚构商品信息、价格、库存
2. 不得给出医疗功效的确定性结论
3. 回答要简洁易懂，适合普通消费者
4. 如果涉及本店商品，只推荐真实存在的商品${context}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
    ];

    let aiReply = await callLLM(messages, 0.7);
    if (!aiReply) {
      aiReply = '抱歉，AI服务暂时不可用，请稍后再试。您也可以直接联系我们的客服了解更多茶品信息。';
    }

    // Save AI message
    await this.client.from('ai_messages').insert({
      conversation_id: convId,
      role: 'assistant',
      content: aiReply,
    });

    return {
      conversation_id: convId,
      reply: aiReply,
    };
  }

  async recommend(body: {
    customer_id?: string;
    preferences: {
      taste?: string;
      aroma?: string;
      scene?: string;
      budget_min?: number;
      budget_max?: number;
      strength?: number;
    };
  }) {
    const { preferences, customer_id } = body;

    // Filter products by business rules first
    let qb = this.client
      .from('products')
      .select('*, product_skus(price, stock), product_brewing(*)')
      .eq('status', 'published');

    if (preferences.aroma) {
      qb = qb.ilike('aroma', `%${preferences.aroma}%`);
    }
    if (preferences.taste) {
      qb = qb.ilike('taste', `%${preferences.taste}%`);
    }
    if (preferences.scene) {
      qb = qb.ilike('scenes', `%${preferences.scene}%`);
    }

    const { data: candidates, error } = await qb.limit(10);
    if (error) throw new Error(`查询商品失败: ${error.message}`);

    // Filter by stock and price
    const available = (candidates || []).filter(p => {
      const skus = (p as any).product_skus || [];
      const hasStock = skus.some((s: any) => s.stock > 0);
      if (!hasStock) return false;
      if (preferences.budget_min || preferences.budget_max) {
        const prices = skus.map((s: any) => parseFloat(s.price));
        const minPrice = Math.min(...prices);
        if (preferences.budget_min && minPrice < preferences.budget_min) return false;
        if (preferences.budget_max && minPrice > preferences.budget_max) return false;
      }
      return true;
    });

    if (available.length === 0) {
      return {
        conversation_id: null,
        recommendations: [],
        ai_advice: '很抱歉，暂时没有完全符合您要求的茶品。您可以放宽一些条件，或者联系我们的茶艺顾问为您一对一推荐。',
      };
    }

    // Use AI to generate recommendations
    const productList = available.map(p => {
      const skus = (p as any).product_skus || [];
      const minPrice = Math.min(...skus.map((s: any) => parseFloat(s.price)));
      return `${p.name}（${p.tea_type}，${p.aroma}，${p.taste}，￥${minPrice}起）`;
    }).join('\n');

    const systemPrompt = `你是一位专业的茶艺顾问。根据用户的偏好，从以下可售茶品中推荐最合适的，并说明推荐理由。回答简洁，最多推荐3款。
用户偏好：口味${preferences.taste || '不限'}，香型${preferences.aroma || '不限'}，场景${preferences.scene || '不限'}，预算${preferences.budget_min || 0}-${preferences.budget_max || '不限'}元
可售茶品：\n${productList}`;

    let aiAdvice = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: '请帮我推荐适合的茶' },
    ], 0.7);
    if (!aiAdvice) {
      aiAdvice = 'AI推荐服务暂时不可用，请浏览商品列表自行挑选。';
    }

    // Save conversation
    let convId: string | null = null;
    if (customer_id) {
      const { data: conv } = await this.client
        .from('ai_conversations')
        .insert({ customer_id, type: 'recommend', title: 'AI选茶推荐' })
        .select()
        .single();
      convId = conv?.id || null;
      if (convId) {
        await this.client.from('ai_messages').insert([
          { conversation_id: convId, role: 'user', content: JSON.stringify(preferences) },
          { conversation_id: convId, role: 'assistant', content: aiAdvice },
        ]);
      }
    }

    return {
      conversation_id: convId,
      recommendations: available.slice(0, 3),
      ai_advice: aiAdvice,
    };
  }

  async recognizeImage(body: {
    customer_id?: string;
    image_url: string;
  }) {
    const { customer_id, image_url } = body;

    // Get all published products for matching
    const { data: products } = await this.client
      .from('products')
      .select('id, name, tea_type, variety, origin, description, cover_image')
      .eq('status', 'published')
      .limit(20);

    const productList = (products || []).map(p =>
      `${p.name}（${p.tea_type}，${p.variety}，${p.origin}）`
    ).join('、');

    const systemPrompt = `你是一位茶叶识别专家。用户会上传一张茶叶或茶包装的照片，请你根据图片内容进行识别分析。
本店有以下茶品：${productList}。
请判断：
1. 是否能匹配本店某款茶品
2. 如果能匹配，说明是哪款茶
3. 如果不能准确匹配，给出茶类级别的判断（如绿茶、红茶等）
4. 给出基础冲泡建议
注意：不要对年份、产地、等级、真伪做确定性判断。`;

    let aiReply = await callLLM([
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: '请帮我识别这张图片中的茶叶' },
          { type: 'image_url', image_url: { url: image_url } },
        ],
      },
    ], 0.5);
    if (!aiReply) {
      aiReply = '图片识别服务暂时不可用，请稍后再试。';
    }

    // Save conversation
    let convId: string | null = null;
    if (customer_id) {
      const { data: conv } = await this.client
        .from('ai_conversations')
        .insert({ customer_id, type: 'recognize', title: '图片识茶' })
        .select()
        .single();
      convId = conv?.id || null;
      if (convId) {
        await this.client.from('ai_messages').insert([
          { conversation_id: convId, role: 'user', content: '上传图片识茶', image_url },
          { conversation_id: convId, role: 'assistant', content: aiReply },
        ]);
      }
    }

    return {
      conversation_id: convId,
      result: aiReply,
      matched_product: null,
    };
  }

  async brewingGuide(body: {
    customer_id?: string;
    product_id: string;
    question?: string;
  }) {
    const { customer_id, product_id, question } = body;

    const { data: product } = await this.client
      .from('products')
      .select('name, tea_type, variety, origin, craft, aroma, taste, product_brewing(*)')
      .eq('id', product_id)
      .maybeSingle();

    if (!product) {
      return { conversation_id: null, reply: '未找到该商品信息' };
    }

    let brewingContext = '';
    if ((product as any).product_brewing) {
      const b = (product as any).product_brewing;
      brewingContext = `茶具：${b.teaware}\n投茶量：${b.tea_amount}\n水量：${b.water_amount}\n水温：${b.water_temp}\n冲泡时间：${b.brew_time}\n推荐泡数：${b.recommended_infusions}\n冲泡提示：${b.tips}`;
    }

    const systemPrompt = `你是一位专业的茶艺师，正在为顾客讲解"${product.name}"的冲泡方法。
茶品信息：${product.name}，${product.tea_type}，${product.variety}，${product.origin}
冲泡信息：${brewingContext}
请用简洁易懂的语言回答用户关于这款茶冲泡的问题。如果用户没有具体问题，就主动介绍冲泡要点。`;

    const userMsg = question || `请告诉我${product.name}怎么泡最好喝`;

    let aiReply = await callLLM([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMsg },
    ], 0.7);
    if (!aiReply) {
      aiReply = brewingContext ? `冲泡建议：${brewingContext}` : '冲泡指导服务暂时不可用。';
    }

    // Save conversation
    let convId: string | null = null;
    if (customer_id) {
      const { data: conv } = await this.client
        .from('ai_conversations')
        .insert({ customer_id, product_id, type: 'brewing', title: `${product.name}冲泡指导` })
        .select()
        .single();
      convId = conv?.id || null;
      if (convId) {
        await this.client.from('ai_messages').insert([
          { conversation_id: convId, role: 'user', content: userMsg },
          { conversation_id: convId, role: 'assistant', content: aiReply },
        ]);
      }
    }

    return {
      conversation_id: convId,
      reply: aiReply,
      brewing_info: (product as any).product_brewing || null,
    };
  }
}
