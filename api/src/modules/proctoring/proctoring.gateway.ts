import { Injectable, MessageEvent } from '@nestjs/common';
import { filter, interval, map, merge, Observable, of, Subject } from 'rxjs';
import type { ProctoringViolation } from 'src/shared/types/proctoring.types';

@Injectable()
export class ProctoringGateway {
  private readonly violationEvents$ = new Subject<{
    teacherId: string;
    violation: ProctoringViolation;
  }>();

  createTeacherStream(teacherId: string): Observable<MessageEvent> {
    return merge(
      of<MessageEvent>({
        type: 'connected',
        data: {
          type: 'connected',
          teacherId,
          connectedAt: new Date().toISOString(),
        },
      }),
      interval(25_000).pipe(
        map(
          (): MessageEvent => ({
            type: 'heartbeat',
            data: {
              type: 'heartbeat',
              timestamp: new Date().toISOString(),
            },
          }),
        ),
      ),
      this.violationEvents$.pipe(
        filter((event) => event.teacherId === teacherId),
        map(
          ({ violation }): MessageEvent => ({
            type: 'violation',
            data: {
              type: 'violation',
              violation,
            },
          }),
        ),
      ),
    );
  }

  async emitViolationToTeacher(
    teacherId: string,
    violation: ProctoringViolation,
  ) {
    this.violationEvents$.next({
      teacherId,
      violation,
    });
  }
}
