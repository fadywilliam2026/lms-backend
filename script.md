// heroku run npx ts-node
// locally npx ts-node

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { PrismaService } from './src/prisma/prisma.service';
const application = await NestFactory.createApplicationContext(AppModule);

const prisma = application.get(PrismaService);
const tokens = await prisma.refreshToken.findMany();
```
