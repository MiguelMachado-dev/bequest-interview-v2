import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>
  ) {}

  findAll() {
    return this.documentsRepository.find();
  }

  create(createDocumentDto: CreateDocumentDto) {
    const document = {
      ...createDocumentDto,
      content: JSON.parse(createDocumentDto.content),
    };
    return this.documentsRepository.save(document);
  }

  async findOne(id: number) {
    const document = await this.documentsRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return document;
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    const document = await this.findOne(id);

    const updateData: Partial<Document> = {
      name: updateDocumentDto.name,
      clauses: updateDocumentDto.clauses,
    };

    if (updateDocumentDto.content) {
      updateData.content = JSON.parse(updateDocumentDto.content);
    }

    const result = await this.documentsRepository.update(id, updateData);
    if (result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return this.documentsRepository.findOne({ where: { id } });
  }

  async delete(id: number) {
    const result = await this.documentsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return result;
  }
}
