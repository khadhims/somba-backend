import { Expose, Transform } from 'class-transformer';
import { toUserSummary } from '../utils/user-summary.util';

export function CreatedByUserExpose() {
  return function (target: object, propertyKey: string) {
    Expose({ name: 'created_by' })(target, propertyKey);
    Transform(({ value }) => toUserSummary(value), { toPlainOnly: true })(
      target,
      propertyKey,
    );
  };
}
