import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  @ApiOperation({
    summary: 'health check',
    description: 'health check',
  })
  @Get()
  getHello(): Record<string, any> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
