import { Injectable, Logger } from '@nestjs/common';
import * as CircuitBreaker from 'opossum';

export interface CircuitBreakerOptions {
  timeout?: number;
  errorThresholdPercentage?: number;
  resetTimeout?: number;
  name?: string;
}

@Injectable()
export class CircuitBreakerService {
  private readonly logger = new Logger(CircuitBreakerService.name);
  private breakers = new Map<string, CircuitBreaker>();

  createBreaker<T>(
    operation: () => Promise<T>,
    options: CircuitBreakerOptions = {},
  ): CircuitBreaker {
    const {
      timeout = 30000, // 30 seconds
      errorThresholdPercentage = 50,
      resetTimeout = 30000, // 30 seconds
      name = 'default',
    } = options;

    const breaker = new CircuitBreaker(operation, {
      timeout,
      errorThresholdPercentage,
      resetTimeout,
      name,
    });

    // Event listeners for monitoring
    breaker.on('open', () => {
      this.logger.warn(`Circuit breaker ${name} opened`);
    });

    breaker.on('close', () => {
      this.logger.log(`Circuit breaker ${name} closed`);
    });

    breaker.on('halfOpen', () => {
      this.logger.log(`Circuit breaker ${name} half-open`);
    });

    breaker.on('fallback', (result) => {
      this.logger.warn(`Circuit breaker ${name} fallback triggered:`, result);
    });

    this.breakers.set(name, breaker);
    return breaker;
  }

  async execute<T>(
    operation: () => Promise<T>,
    operationName: string,
    options?: CircuitBreakerOptions,
  ): Promise<T> {
    let breaker = this.breakers.get(operationName);

    if (!breaker) {
      breaker = this.createBreaker(operation, { ...options, name: operationName });
    }

    try {
      return await breaker.fire();
    } catch (error) {
      this.logger.error(`Circuit breaker ${operationName} failed:`, error);
      throw error;
    }
  }

  getBreaker(name: string): CircuitBreaker | undefined {
    return this.breakers.get(name);
  }

  getAllBreakers(): Map<string, CircuitBreaker> {
    return this.breakers;
  }

  removeBreaker(name: string): boolean {
    return this.breakers.delete(name);
  }

  // Health check method
  getBreakerStats(name: string) {
    const breaker = this.breakers.get(name);
    if (!breaker) {
      return null;
    }

    return {
      name,
      state: breaker.opened ? 'open' : breaker.halfOpen ? 'half-open' : 'closed',
      stats: breaker.stats,
    };
  }
}