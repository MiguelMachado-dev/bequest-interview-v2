import { DocumentsController } from '../documents.controller';
import { DocumentsService } from '../documents.service';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeleteResult } from 'typeorm';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let documentsService: DocumentsService;

  beforeEach(() => {
    // Create mock service
    documentsService = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    } as unknown as DocumentsService;

    // Create controller with mock service
    controller = new DocumentsController(documentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAll', () => {
    it('should return an array of documents', async () => {
      const expectedDocuments = [
        {
          id: 1,
          name: 'Test Document',
          clauses: 'Test Clauses',
          content: { data: 'test content' },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      documentsService.findAll = vi.fn().mockResolvedValue(expectedDocuments);

      const result = await controller.getAll();
      expect(result).toBe(expectedDocuments);
      expect(documentsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a document when it exists', async () => {
      const expectedDocument = {
        id: 1,
        name: 'Test Document',
        clauses: 'Test Clauses',
        content: { data: 'test content' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      documentsService.findOne = vi.fn().mockResolvedValue(expectedDocument);

      const result = await controller.findOne(1);
      expect(result).toBe(expectedDocument);
      expect(documentsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when document does not exist', async () => {
      documentsService.findOne = vi
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(documentsService.findOne).toHaveBeenCalledWith(999);
    });
  });

  describe('create', () => {
    it('should create and return a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        name: 'New Document',
        clauses: 'New Clauses',
        content: JSON.stringify({ data: 'new content' }),
      };

      const createdDocument = {
        id: 1,
        name: 'New Document',
        clauses: 'New Clauses',
        content: { data: 'new content' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentsService.create = vi.fn().mockResolvedValue(createdDocument);

      const result = await controller.create(createDocumentDto);
      expect(result).toBe(createdDocument);
      expect(documentsService.create).toHaveBeenCalledWith(createDocumentDto);
    });
  });

  describe('update', () => {
    it('should update and return a document', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        name: 'Updated Document',
        clauses: 'Updated Clauses',
        content: JSON.stringify({ data: 'updated content' }),
      };

      const updatedDocument = {
        id: 1,
        name: 'Updated Document',
        clauses: 'Updated Clauses',
        content: { data: 'updated content' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      documentsService.update = vi.fn().mockResolvedValue(updatedDocument);

      const result = await controller.update(1, updateDocumentDto);
      expect(result).toBe(updatedDocument);
      expect(documentsService.update).toHaveBeenCalledWith(
        1,
        updateDocumentDto
      );
    });

    it('should throw NotFoundException when document does not exist', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        name: 'Updated Document',
      };

      documentsService.update = vi
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(controller.update(999, updateDocumentDto)).rejects.toThrow(
        NotFoundException
      );
      expect(documentsService.update).toHaveBeenCalledWith(
        999,
        updateDocumentDto
      );
    });
  });

  describe('delete', () => {
    it('should delete a document', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: {} };
      documentsService.delete = vi.fn().mockResolvedValue(deleteResult);

      const result = await controller.delete(1);
      expect(result).toBe(deleteResult);
      expect(documentsService.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when document does not exist', async () => {
      documentsService.delete = vi
        .fn()
        .mockRejectedValue(new NotFoundException());

      await expect(controller.delete(999)).rejects.toThrow(NotFoundException);
      expect(documentsService.delete).toHaveBeenCalledWith(999);
    });
  });
});
