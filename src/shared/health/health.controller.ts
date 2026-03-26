import { Controller, Get } from '@nestjs/common';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
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
    return this.health.check([
      /**
       * Check how much storage is in use, if that exceeds more than 50% of the total storage
       * space it would response with an unhealthy Health Check.
       */
      () =>
        this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),

      /**
       * Check the heap of process to make sure process does not exceed a certain memory
       * limit the `MemoryHealthIndicator` can be used.
       *
       * Heap is the portion of memory where dynamically allocated memory resides (i.e.
       * memory allocated via malloc). Memory allocated from the heap will remain allocated
       * until one of the following occurs:
       *
       * - The memory is free'd
       * - The program terminates
       */
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),

      /**
       * Verify the memory RSS of process, this would return an unhealthy response code in
       * case the process does have more than 150MB allocated.
       *
       * RSS is the Resident Set Size and is used to show how much memory is allocated to
       * that process and is in RAM. It does not include memory that is swapped out. It does
       * include memory from shared libraries as long as the pages from those libraries are
       * actually in memory. It does include all stack and heap memory.
       */
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
    ]);
  }
}
