import { ForbiddenError } from '@casl/ability';
import { PrismaAbility } from '@casl/prisma';
import { Catch, ExceptionFilter, ForbiddenException } from '@nestjs/common';
import { Action } from '../common/types/action';
import { Subject } from '../common/types/subject';

type AppAbility = PrismaAbility<[Action, Subject]>;

@Catch(ForbiddenError)
export class CaslExceptionFilter implements ExceptionFilter {
  catch(exception: ForbiddenError<AppAbility>) {
    throw new ForbiddenException(exception.message);
  }
}
