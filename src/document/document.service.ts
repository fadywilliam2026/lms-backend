import { ForbiddenException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { Document, DocumentOwnerType } from '@prisma/client';
import { MulterFile } from '@webundsoehne/nest-fastify-file-upload/dist/interfaces/multer-options.interface';
import { GoogleCloudStorageService } from '../google-cloud-storage/google-cloud-storage.service';
import { StorageFile } from '../google-cloud-storage/types/storage-file.type';
import { PrismaService } from 'nestjs-prisma';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleCloudStorageService: GoogleCloudStorageService,
  ) {}

  private getDocumentLocation(document: Document) {
    return `documents/${document.ownerType}/${document.ownerId}/${document.type}-${document.id}.${document.originalName
      .split('.')
      .slice(-1)}`.toUpperCase();
  }

  async create(ownerType: DocumentOwnerType, ownerId: number, createDocumentDto: CreateDocumentDto, file: MulterFile) {
    let document = await this.prismaService.document.create({
      data: {
        ownerType,
        ownerId,
        originalName: file.originalname,
        ...createDocumentDto,
      },
    });

    const documentLocation = this.getDocumentLocation(document);

    await this.googleCloudStorageService.save(documentLocation, file.buffer);

    document = await this.prismaService.document.update({
      where: { id: document.id },
      data: {
        location: documentLocation,
      },
    });

    return document;
  }

  async findManyByOwnerId(ownerType: DocumentOwnerType, ownerId: number) {
    return await this.prismaService.document.findMany({ where: { ownerId, ownerType } }).then(async documents => {
      return await Promise.all(
        documents.map(async doc => ({
          ...doc,
          signedUrl: await this.googleCloudStorageService.getSignedUrl(this.getDocumentLocation(doc)),
        })),
      );
    });
  }

  async file(ownerType: DocumentOwnerType, ownerId: number, id: number) {
    const document = await this.prismaService.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new NotFoundException('File not found');
    }

    if (document.ownerType != ownerType || document.ownerId != ownerId) {
      throw new ForbiddenException('Access denied');
    }

    let storageFile: StorageFile;
    try {
      storageFile = await this.googleCloudStorageService.file(this.getDocumentLocation(document));
    } catch (e) {
      if (e.message.toString().includes('No such object')) {
        throw new NotFoundException('File not found');
      } else {
        throw new ServiceUnavailableException('Internal server error');
      }
    }

    return storageFile.buffer;
  }

  async updateDocumentsIfNeeded(documents: Array<{ id: number; type: string }>) {
    return await this.prismaService.$transaction(async prisma => {
      return prisma.document
        .findMany({
          where: {
            id: {
              in: documents.map(document => document.id),
            },
          },
        })
        .then(
          async storedDocuments =>
            await Promise.all(
              storedDocuments
                .filter(
                  storedDocument =>
                    storedDocument.type !== documents.find(document => document.id === storedDocument.id).type,
                )
                .map(storedDocument => {
                  const newType = documents.find(document => document.id === storedDocument.id).type;
                  return prisma.document
                    .update({
                      where: { id: storedDocument.id },
                      data: { type: newType },
                    })
                    .then(() => {
                      return this.googleCloudStorageService.rename(
                        this.getDocumentLocation(storedDocument),
                        this.getDocumentLocation({
                          ...storedDocument,
                          type: newType,
                        }),
                      );
                    });
                }),
            ),
        );
    });
  }

  async deleteDocumentsIfNeeded(
    ownerType: DocumentOwnerType,
    ownerId: number,
    documents: Array<{ id: number; type: string }>,
  ) {
    return await this.prismaService.$transaction(async prisma => {
      return prisma.document
        .findMany({
          where: {
            ownerType,
            ownerId,
          },
        })
        .then(
          async storedDocuments =>
            await Promise.all(
              storedDocuments
                .filter(storedDocument => !documents.find(document => document.id === storedDocument.id))
                .map(storedDocument => {
                  return prisma.document
                    .delete({
                      where: { id: storedDocument.id },
                    })
                    .then(() => {
                      return this.googleCloudStorageService.delete(this.getDocumentLocation(storedDocument));
                    });
                }),
            ),
        );
    });
  }
}
