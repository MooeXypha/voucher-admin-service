import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HealthIndicatorFunction,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly disk: DiskHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const heapThresholdMb = Number(process.env.HEALTH_MEMORY_HEAP_MB ?? '256');
    const rssThresholdMb = Number(process.env.HEALTH_MEMORY_RSS_MB ?? '512');
    const storageThresholdPercent = Number(
      process.env.HEALTH_STORAGE_THRESHOLD_PERCENT ?? '0.98',
    );
    const storagePath = process.env.HEALTH_STORAGE_PATH ?? '/tmp';
    const enableStorageCheck =
      (process.env.HEALTH_CHECK_STORAGE ?? 'true').toLowerCase() !== 'false';

    const checks: HealthIndicatorFunction[] = [
      () => this.memory.checkHeap('memory_heap', heapThresholdMb * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', rssThresholdMb * 1024 * 1024),
    ];

    if (enableStorageCheck) {
      checks.push(() =>
        this.disk.checkStorage('storage', {
          path: storagePath,
          thresholdPercent: storageThresholdPercent,
        }),
      );
    }

    return this.health.check(checks);
  }
}
