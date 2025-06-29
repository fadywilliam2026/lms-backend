import { Body, Controller, Get, Param, Post, Res, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { DocumentOwnerType } from '@prisma/client';
import { AnyFilesInterceptor } from '@webundsoehne/nest-fastify-file-upload';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';
import { Permission } from '../auth/jwt-auth.guard';
import { Action } from '../common/types/action';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ParseAndValidateJsonPipe } from '../pipes/parse-and-validate-json.pipe';

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents/:ownerType/:ownerId')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  getOwnerType(ownerType: string) {
    return ownerType.toUpperCase().slice(0, -1);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'List of files',
    required: true,
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
        createDocumentDto: {
          type: 'object',
          properties: {
            type: { type: 'string' },
            description: { type: 'string' },
            customFields: {
              type: 'object',
              properties: {
                industry: { type: 'string' },
                commercialRecord: { type: 'string' },
                establishmentDate: { type: 'date' },
              },
            },
          },
        },
      },
    },
  })
  @Permission([Action.Create, 'Document'])
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async create(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
    @Body('createDocumentDto', new ParseAndValidateJsonPipe(CreateDocumentDto)) createDocumentDto,
    @UploadedFiles() files: MulterFile[],
  ) {
    return await Promise.all(
      files.map(file =>
        this.documentService.create(
          this.getOwnerType(ownerType) as DocumentOwnerType,
          +ownerId,
          createDocumentDto,
          file,
        ),
      ),
    );
  }

  @Permission([Action.Read, 'Document'])
  @Get()
  async findManyByOwnerId(@Param('ownerType') ownerType: string, @Param('ownerId') ownerId: string) {
    return this.documentService.findManyByOwnerId(this.getOwnerType(ownerType) as DocumentOwnerType, +ownerId);
  }

  @Permission([Action.Read, 'Document'])
  @Get(':id/file')
  async file(
    @Param('ownerType') ownerType: string,
    @Param('ownerId') ownerId: string,
    @Param('id') id: string,
    @Res() res: any,
  ) {
    res.send(await this.documentService.file(this.getOwnerType(ownerType) as DocumentOwnerType, +ownerId, +id));
  }
}
