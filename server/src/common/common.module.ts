import { Module } from '@nestjs/common';
import { LoggerService } from './services/logger.service';
import { CircuitBreakerService } from './services/circuit-breaker.service';

@Module({
  providers: [LoggerService, CircuitBreakerService],
  exports: [LoggerService, CircuitBreakerService],
})
export class CommonModule {}