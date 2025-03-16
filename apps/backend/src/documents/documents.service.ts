import { Injectable } from '@nestjs/common';
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
    return this.documentsRepository.save(createDocumentDto);
  }

  findOne(id: number) {
    return this.documentsRepository.findOne({ where: { id } });
  }

  async update(id: number, updateDocumentDto: UpdateDocumentDto) {
    await this.documentsRepository.update(id, updateDocumentDto);

    return this.documentsRepository.findOne({ where: { id } });
  }

  delete(id: number) {
    return this.documentsRepository.delete(id);
  }
}
