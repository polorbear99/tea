import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: {
    customer_id?: string;
    product_id?: string;
    message: string;
    conversation_id?: string;
    type?: string;
  }) {
    const result = await this.aiService.chat(body);
    return { code: 200, msg: 'success', data: result };
  }

  @Post('recommend')
  async recommend(@Body() body: {
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
    const result = await this.aiService.recommend(body);
    return { code: 200, msg: 'success', data: result };
  }

  @Post('recognize')
  async recognizeImage(@Body() body: {
    customer_id?: string;
    image_url: string;
  }) {
    const result = await this.aiService.recognizeImage(body);
    return { code: 200, msg: 'success', data: result };
  }

  @Post('brewing')
  async brewingGuide(@Body() body: {
    customer_id?: string;
    product_id: string;
    question?: string;
  }) {
    const result = await this.aiService.brewingGuide(body);
    return { code: 200, msg: 'success', data: result };
  }
}
