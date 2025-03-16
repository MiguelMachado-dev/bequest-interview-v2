import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../document-utils', () => ({
  parseSfdtContent: vi.fn(),
  serializeSfdtContent: vi.fn(),
  findPlaceholders: vi.fn(),
  extractPlaceholderName: vi.fn(),
  findTextInDocument: vi.fn(),
}));

import { DocumentService, removeClauseUsingEditor } from '../document-service';
import * as documentUtils from '../document-utils';

describe('DocumentService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('addClauseToDocument', () => {
    it('should add clause when matching placeholder is found', () => {
      const documentContent = 'document content';
      const clause = {
        name: 'Test Clause',
        initial: 'Initial text',
        content: 'Clause content',
      };

      const mockSfdtObject = { sec: [{ b: [] }] };
      const mockPlaceholder = {
        placeholder: '{testclause}',
        path: ['sec', '0', 'b', '0', 'tlp'],
      };

      const mockClauseSfdt = {
        sec: [
          {
            b: [{ text: 'clause paragraph' }],
          },
        ],
      };

      (documentUtils.parseSfdtContent as any).mockImplementation(
        (content: string) => {
          if (content === 'Clause content') return mockClauseSfdt;
          return mockSfdtObject;
        }
      );
      (documentUtils.findPlaceholders as any).mockReturnValue([
        mockPlaceholder,
      ]);
      (documentUtils.extractPlaceholderName as any).mockReturnValue(
        'testclause'
      );
      (documentUtils.serializeSfdtContent as any).mockReturnValue(
        'updated content'
      );

      const result = DocumentService.addClauseToDocument(
        documentContent,
        clause
      );

      expect(result).toBe('updated content');
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(documentUtils.findPlaceholders).toHaveBeenCalledWith(
        mockSfdtObject
      );
      expect(documentUtils.extractPlaceholderName).toHaveBeenCalledWith(
        '{testclause}'
      );
      expect(documentUtils.serializeSfdtContent).toHaveBeenCalled();
    });

    it('should add clause to the end when no matching placeholder is found', () => {
      const documentContent = 'document content';
      const clause = {
        name: 'Test Clause',
        initial: 'Initial text',
        content: 'Clause content',
      };

      const mockSfdtObject = {
        sec: [
          {
            b: [{ text: 'existing paragraph' }],
          },
        ],
      };
      const mockClauseSfdt = {
        sec: [
          {
            b: [{ text: 'clause paragraph' }],
          },
        ],
      };

      (documentUtils.parseSfdtContent as any).mockImplementation(
        (content: string) => {
          if (content === 'Clause content') return mockClauseSfdt;
          return mockSfdtObject;
        }
      );
      (documentUtils.findPlaceholders as any).mockReturnValue([]);
      (documentUtils.serializeSfdtContent as any).mockReturnValue(
        'updated content'
      );

      const result = DocumentService.addClauseToDocument(
        documentContent,
        clause
      );

      expect(result).toBe('updated content');
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(documentUtils.findPlaceholders).toHaveBeenCalledWith(
        mockSfdtObject
      );
      expect(documentUtils.serializeSfdtContent).toHaveBeenCalled();
    });

    it('should return original content if parsing fails', () => {
      const documentContent = 'document content';
      const clause = {
        name: 'Test Clause',
        initial: 'Initial text',
        content: 'Clause content',
      };

      (documentUtils.parseSfdtContent as any).mockReturnValue(null);
      console.error = vi.fn();

      const result = DocumentService.addClauseToDocument(
        documentContent,
        clause
      );

      expect(result).toBe(documentContent);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(console.error).toHaveBeenCalled();
    });

    it('should handle clause parsing failure', () => {
      const documentContent = 'document content';
      const clause = {
        name: 'Test Clause',
        initial: 'Initial text',
        content: 'Clause content',
      };

      const mockSfdtObject = { sec: [{ b: [] }] };

      (documentUtils.parseSfdtContent as any).mockImplementation(
        (content: string) => {
          if (content === 'Clause content') return null;
          return mockSfdtObject;
        }
      );
      (documentUtils.findPlaceholders as any).mockReturnValue([]);
      (documentUtils.serializeSfdtContent as any).mockReturnValue(
        'updated content'
      );
      console.error = vi.fn();

      const result = DocumentService.addClauseToDocument(
        documentContent,
        clause
      );

      expect(result).toBe(documentContent);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        'Clause content'
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('removeClauseFromDocument', () => {
    it('should remove clause when found in document', () => {
      const documentContent = 'document content';
      const clause = {
        initial: 'Initial text',
      };

      const mockSfdtObject = {
        sec: [
          {
            b: [{ text: 'Initial text' }, { text: 'Other paragraph' }],
          },
        ],
      };

      (documentUtils.parseSfdtContent as any).mockReturnValue(mockSfdtObject);
      (documentUtils.findTextInDocument as any).mockReturnValue([
        { path: ['sec', '0', 'b', '0'] },
      ]);
      (documentUtils.serializeSfdtContent as any).mockReturnValue(
        'updated content'
      );

      const result = DocumentService.removeClauseFromDocument(
        documentContent,
        clause
      );

      expect(result).toBe('updated content');
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(documentUtils.findTextInDocument).toHaveBeenCalledWith(
        mockSfdtObject,
        'Initial text'
      );
      expect(documentUtils.serializeSfdtContent).toHaveBeenCalled();
    });

    it('should return original content if clause not found', () => {
      const documentContent = 'document content';
      const clause = {
        initial: 'Initial text',
      };

      const mockSfdtObject = { sec: [{ b: [] }] };

      (documentUtils.parseSfdtContent as any).mockReturnValue(mockSfdtObject);
      (documentUtils.findTextInDocument as any).mockReturnValue([]);
      console.warn = vi.fn();

      const result = DocumentService.removeClauseFromDocument(
        documentContent,
        clause
      );

      expect(result).toBe(documentContent);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(documentUtils.findTextInDocument).toHaveBeenCalledWith(
        mockSfdtObject,
        'Initial text'
      );
      expect(console.warn).toHaveBeenCalled();
    });

    it('should return original content if parsing fails', () => {
      const documentContent = 'document content';
      const clause = {
        initial: 'Initial text',
      };

      (documentUtils.parseSfdtContent as any).mockReturnValue(null);
      console.error = vi.fn();

      const result = DocumentService.removeClauseFromDocument(
        documentContent,
        clause
      );

      expect(result).toBe(documentContent);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('processTemplates', () => {
    it('should return original content if parsing fails', () => {
      const documentContent = 'document content';
      const templateValues = {
        name: 'John Doe',
      };

      (documentUtils.parseSfdtContent as any).mockReturnValue(null);
      console.error = vi.fn();

      const result = DocumentService.processTemplates(
        documentContent,
        templateValues
      );

      expect(result).toBe(documentContent);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('identifyPlaceholders', () => {
    it('should identify placeholders in document', () => {
      const documentContent = 'document content';
      const mockSfdtObject = { sec: [{ b: [] }] };
      const mockPlaceholders = [
        { placeholder: '{name}' },
        { placeholder: '{date}' },
      ];

      (documentUtils.parseSfdtContent as any).mockReturnValue(mockSfdtObject);
      (documentUtils.findPlaceholders as any).mockReturnValue(mockPlaceholders);
      (documentUtils.extractPlaceholderName as any).mockImplementation(
        (placeholder: string) => {
          if (placeholder === '{name}') return 'name';
          if (placeholder === '{date}') return 'date';
          return null;
        }
      );

      const result = DocumentService.identifyPlaceholders(documentContent);

      expect(result).toEqual(['name', 'date']);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(documentUtils.findPlaceholders).toHaveBeenCalledWith(
        mockSfdtObject
      );
      expect(documentUtils.extractPlaceholderName).toHaveBeenCalledTimes(2);
    });

    it('should filter out duplicate placeholders', () => {
      const documentContent = 'document content';
      const mockSfdtObject = { sec: [{ b: [] }] };
      const mockPlaceholders = [
        { placeholder: '{name}' },
        { placeholder: '{name}' }, // Duplicate
        { placeholder: '{date}' },
      ];

      (documentUtils.parseSfdtContent as any).mockReturnValue(mockSfdtObject);
      (documentUtils.findPlaceholders as any).mockReturnValue(mockPlaceholders);
      (documentUtils.extractPlaceholderName as any).mockImplementation(
        (placeholder: string) => {
          if (placeholder === '{name}') return 'name';
          if (placeholder === '{date}') return 'date';
          return null;
        }
      );

      const result = DocumentService.identifyPlaceholders(documentContent);

      expect(result).toEqual(['name', 'date']);
      expect(documentUtils.extractPlaceholderName).toHaveBeenCalledTimes(3);
    });

    it('should filter out null placeholder names', () => {
      const documentContent = 'document content';
      const mockSfdtObject = { sec: [{ b: [] }] };
      const mockPlaceholders = [
        { placeholder: '{name}' },
        { placeholder: '{invalid}' },
      ];

      (documentUtils.parseSfdtContent as any).mockReturnValue(mockSfdtObject);
      (documentUtils.findPlaceholders as any).mockReturnValue(mockPlaceholders);
      (documentUtils.extractPlaceholderName as any).mockImplementation(
        (placeholder: string) => {
          if (placeholder === '{name}') return 'name';
          return null;
        }
      );

      const result = DocumentService.identifyPlaceholders(documentContent);

      expect(result).toEqual(['name']);
      expect(documentUtils.extractPlaceholderName).toHaveBeenCalledTimes(2);
    });

    it('should return empty array if parsing fails', () => {
      const documentContent = 'document content';

      (documentUtils.parseSfdtContent as any).mockReturnValue(null);
      console.error = vi.fn();

      // Call the actual method
      const result = DocumentService.identifyPlaceholders(documentContent);

      // Verify the result
      expect(result).toEqual([]);
      expect(documentUtils.parseSfdtContent).toHaveBeenCalledWith(
        documentContent
      );
      expect(console.error).toHaveBeenCalled();
    });
  });
});

describe('removeClauseUsingEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should remove clause using editor', () => {
    // Create a mock document editor with the expected methods
    const mockSearchModule = {
      clearSearchHighlight: vi.fn(),
      findAll: vi.fn(),
      searchResults: [{}],
      currentSearchResultIndex: 0,
    };

    const mockSelection = {
      startParagraphIndex: 0,
      selectParagraphByIndex: vi.fn(),
    };

    const mockEditorModule = {
      delete: vi.fn(),
    };

    const documentEditor = {
      search: mockSearchModule,
      selection: mockSelection,
      editor: mockEditorModule,
    };

    const clauseToRemove = {
      initial: 'Initial text',
    };

    // Call the actual function
    const result = removeClauseUsingEditor(documentEditor, clauseToRemove);

    // Verify the expected behavior
    expect(mockSearchModule.clearSearchHighlight).toHaveBeenCalled();
    expect(mockSearchModule.findAll).toHaveBeenCalledWith('Initial text', {
      matchCase: false,
      wholeWord: false,
    });
    expect(mockSelection.selectParagraphByIndex).toHaveBeenCalledWith(0);
    expect(mockEditorModule.delete).toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('should return false if clause not found', () => {
    // Create a mock document editor with the expected methods
    const mockSearchModule = {
      clearSearchHighlight: vi.fn(),
      findAll: vi.fn(),
      searchResults: [], // Empty results
      currentSearchResultIndex: 0,
    };

    const documentEditor = {
      search: mockSearchModule,
    };

    const clauseToRemove = {
      initial: 'Initial text',
    };

    // Call the actual function
    const result = removeClauseUsingEditor(documentEditor, clauseToRemove);

    // Verify the expected behavior
    expect(mockSearchModule.clearSearchHighlight).toHaveBeenCalled();
    expect(mockSearchModule.findAll).toHaveBeenCalledWith('Initial text', {
      matchCase: false,
      wholeWord: false,
    });
    expect(result).toBe(false);
  });

  it('should return false if document editor is missing', () => {
    const clauseToRemove = {
      initial: 'Initial text',
    };

    console.error = vi.fn();

    // Call the actual function with null editor
    const result = removeClauseUsingEditor(null, clauseToRemove);

    // Verify the expected behavior
    expect(console.error).toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('should handle exceptions', () => {
    // Create a problematic mock document editor
    const mockSearchModule = {
      clearSearchHighlight: vi.fn().mockImplementation(() => {
        throw new Error('Test error');
      }),
      findAll: vi.fn(),
    };

    const documentEditor = {
      search: mockSearchModule,
    };

    const clauseToRemove = {
      initial: 'Initial text',
    };

    console.error = vi.fn();

    // Call the actual function
    const result = removeClauseUsingEditor(documentEditor, clauseToRemove);

    // Verify the expected behavior
    expect(mockSearchModule.clearSearchHighlight).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
    expect(result).toBe(false);
  });
});
