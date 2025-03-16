import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { DocumentsService } from '../documents.service';
import { Document } from '../entities/document.entity';
import { NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from '../dto/create-document.dto';
import { UpdateDocumentDto } from '../dto/update-document.dto';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Document entity to avoid TypeORM decorator issues in tests
vi.mock('../entities/document.entity', () => {
  class MockDocument {
    id: number;
    name: string;
    clauses: string;
    content: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
  }
  return { Document: MockDocument };
});

type MockRepository<T = any> = Partial<
  Record<keyof Repository<T>, ReturnType<typeof vi.fn>>
>;

const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: vi.fn(),
  findOne: vi.fn(),
  save: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});

describe('DocumentsService', () => {
  let service: DocumentsService;
  let repository: MockRepository<Document>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        {
          provide: getRepositoryToken(Document),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    repository = module.get<MockRepository<Document>>(
      getRepositoryToken(Document)
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
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
      repository.find.mockResolvedValue(expectedDocuments);

      const result = await service.findAll();
      expect(result).toEqual(expectedDocuments);
      expect(repository.find).toHaveBeenCalled();
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
      repository.findOne.mockResolvedValue(expectedDocument);

      const result = await service.findOne(1);
      expect(result).toEqual(expectedDocument);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when document does not exist', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });
  });

  describe('create', () => {
    it('should create and return a document', async () => {
      const createDocumentDto: CreateDocumentDto = {
        name: 'New Document',
        clauses: 'New Clauses',
        content: JSON.stringify({ data: 'new content' }),
      };

      const savedDocument = {
        id: 1,
        name: 'New Document',
        clauses: 'New Clauses',
        content: { data: 'new content' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.save.mockResolvedValue(savedDocument);

      const result = await service.create(createDocumentDto);
      expect(result).toEqual(savedDocument);
      expect(repository.save).toHaveBeenCalledWith({
        name: 'New Document',
        clauses: 'New Clauses',
        content: { data: 'new content' },
      });
    });
  });

  describe('update', () => {
    it('should update and return a document when it exists', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        name: 'Updated Document',
        clauses: 'Updated Clauses',
        content: JSON.stringify({ data: 'updated content' }),
      };

      const existingDocument = {
        id: 1,
        name: 'Test Document',
        clauses: 'Test Clauses',
        content: { data: 'test content' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedDocument = {
        ...existingDocument,
        name: 'Updated Document',
        clauses: 'Updated Clauses',
        content: { data: 'updated content' },
      };

      repository.findOne.mockResolvedValueOnce(existingDocument);
      repository.update.mockResolvedValue({ affected: 1 });
      repository.findOne.mockResolvedValueOnce(updatedDocument);

      const result = await service.update(1, updateDocumentDto);
      expect(result).toEqual(updatedDocument);
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(repository.update).toHaveBeenCalledWith(1, {
        name: 'Updated Document',
        clauses: 'Updated Clauses',
        content: { data: 'updated content' },
      });
    });

    it('should throw NotFoundException when document does not exist during update', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        name: 'Updated Document',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDocumentDto)).rejects.toThrow(
        NotFoundException
      );
      expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 999 } });
    });

    it('should throw NotFoundException when update affected 0 rows', async () => {
      const updateDocumentDto: UpdateDocumentDto = {
        name: 'Updated Document',
      };

      const existingDocument = {
        id: 1,
        name: 'Test Document',
        clauses: 'Test Clauses',
        content: { data: 'test content' },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOne.mockResolvedValue(existingDocument);
      repository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(1, updateDocumentDto)).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('delete', () => {
    it('should delete a document when it exists', async () => {
      const deleteResult: DeleteResult = { affected: 1, raw: {} };
      repository.delete.mockResolvedValue(deleteResult);

      const result = await service.delete(1);
      expect(result).toEqual(deleteResult);
      expect(repository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException when document does not exist during delete', async () => {
      repository.delete.mockResolvedValue({
        affected: 0,
        raw: {},
      } as DeleteResult);

      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
      expect(repository.delete).toHaveBeenCalledWith(999);
    });
  });
});
