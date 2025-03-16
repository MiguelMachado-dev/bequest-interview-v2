import {
  parseSfdtContent,
  serializeSfdtContent,
  findPlaceholders,
  extractPlaceholderName,
  findTextInDocument,
} from './document-utils';

export class DocumentService {
  static addClauseToDocument(documentContent: string, clause: any): string {
    try {
      const sfdtObject = parseSfdtContent(documentContent);
      if (!sfdtObject) {
        console.error('Failed to parse document content');
        return documentContent;
      }

      const initialText = clause.initial;

      const clauseName = clause.name.toLowerCase().replace(/\s+/g, '');
      const placeholders = findPlaceholders(sfdtObject);

      const matchingPlaceholder = placeholders.find((p) => {
        const name = extractPlaceholderName(p.placeholder);
        if (!name) return false;

        return (
          name.toLowerCase().includes(clauseName) ||
          clauseName.includes(name.toLowerCase())
        );
      });

      if (matchingPlaceholder) {
        const updatedSfdt = this.replacePlaceholderWithClause(
          sfdtObject,
          matchingPlaceholder,
          clause.content
        );

        return serializeSfdtContent(updatedSfdt);
      }

      const sections = sfdtObject.sec || [];
      if (sections.length > 0) {
        const lastSection = sections[sections.length - 1];
        const paragraphs = lastSection.b || [];

        const clauseSfdt = parseSfdtContent(clause.content);
        if (
          !clauseSfdt ||
          !clauseSfdt.sec ||
          !clauseSfdt.sec[0] ||
          !clauseSfdt.sec[0].b
        ) {
          console.error('Failed to parse clause content');
          return documentContent;
        }

        const clauseParagraphs = clauseSfdt.sec[0].b;

        lastSection.b = [...paragraphs, ...clauseParagraphs];

        return serializeSfdtContent(sfdtObject);
      }

      const clauseSfdt = parseSfdtContent(clause.content);
      if (!clauseSfdt || !clauseSfdt.sec) {
        console.error('Failed to parse clause content');
        return documentContent;
      }

      sfdtObject.sec = [...(sfdtObject.sec || []), ...clauseSfdt.sec];

      return serializeSfdtContent(sfdtObject);
    } catch (error) {
      console.error('Error adding clause to document:', error);
      return documentContent;
    }
  }

  static removeClauseFromDocument(
    documentContent: string,
    clause: any
  ): string {
    try {
      const sfdtObject = parseSfdtContent(documentContent);
      if (!sfdtObject) {
        console.error('Failed to parse document content');
        return documentContent;
      }

      const clauseInfo = this.identifyClauseInDocument(
        sfdtObject,
        clause.initial
      );
      if (!clauseInfo) {
        console.warn('Clause not found in document');
        return documentContent;
      }

      const updatedSfdt = this.removeClauseWithInfo(sfdtObject, clauseInfo);

      return serializeSfdtContent(updatedSfdt);
    } catch (error) {
      console.error('Error removing clause from document:', error);
      return documentContent;
    }
  }

  static processTemplates(
    documentContent: string,
    templateValues: Record<string, string>
  ): string {
    try {
      const sfdtObject = parseSfdtContent(documentContent);
      if (!sfdtObject) {
        console.error('Failed to parse document content');
        return documentContent;
      }

      const placeholders = findPlaceholders(sfdtObject);

      let updatedSfdt = JSON.parse(JSON.stringify(sfdtObject));

      placeholders.forEach((placeholder) => {
        const name = extractPlaceholderName(placeholder.placeholder);
        if (name && templateValues[name]) {
          let current = updatedSfdt;
          for (let i = 0; i < placeholder.path.length - 1; i++) {
            current = current[placeholder.path[i]];
          }

          const lastKey = placeholder.path[placeholder.path.length - 1];
          const originalText = current[lastKey].tlp;
          current[lastKey].tlp = originalText.replace(
            `{${name}}`,
            templateValues[name]
          );
        }
      });

      return serializeSfdtContent(updatedSfdt);
    } catch (error) {
      console.error('Error processing templates:', error);
      return documentContent;
    }
  }

  static identifyPlaceholders(documentContent: string): string[] {
    try {
      const sfdtObject = parseSfdtContent(documentContent);
      if (!sfdtObject) {
        console.error('Failed to parse document content');
        return [];
      }

      const placeholders = findPlaceholders(sfdtObject);

      const placeholderNames = placeholders
        .map((p) => extractPlaceholderName(p.placeholder))
        .filter((name): name is string => name !== null)
        .filter((name, index, self) => self.indexOf(name) === index);

      return placeholderNames;
    } catch (error) {
      console.error('Error identifying placeholders:', error);
      return [];
    }
  }

  private static replacePlaceholderWithClause(
    sfdtObject: any,
    placeholder: any,
    clauseContent: string
  ): any {
    try {
      const clauseSfdt = parseSfdtContent(clauseContent);
      if (!clauseSfdt || !clauseSfdt.sec || clauseSfdt.sec.length === 0) {
        console.error('Invalid clause SFDT content');
        return sfdtObject;
      }

      const updatedSfdt = JSON.parse(JSON.stringify(sfdtObject));

      const clauseParagraphs: any[] = [];
      clauseSfdt.sec.forEach((section: any) => {
        if (section.b && Array.isArray(section.b)) {
          clauseParagraphs.push(...section.b);
        }
      });

      if (clauseParagraphs.length === 0) {
        console.error('No paragraphs found in clause content');
        return updatedSfdt;
      }

      const path = placeholder.path;
      let sectionIndex = -1;
      let paragraphIndex = -1;

      for (let i = 0; i < path.length; i++) {
        if (path[i] === 'sec' && i + 1 < path.length) {
          sectionIndex = parseInt(path[i + 1]);
        }

        if (path[i] === 'b' && i + 1 < path.length) {
          paragraphIndex = parseInt(path[i + 1]);
          break;
        }
      }

      if (sectionIndex === -1 || paragraphIndex === -1) {
        console.error('Could not locate paragraph containing placeholder');
        return updatedSfdt;
      }

      updatedSfdt.sec[sectionIndex].b.splice(
        paragraphIndex + 1,
        0,
        ...clauseParagraphs
      );

      return updatedSfdt;
    } catch (error) {
      console.error('Error replacing placeholder with clause:', error);
      return sfdtObject;
    }
  }

  private static identifyClauseInDocument(
    sfdtObject: any,
    clauseText: string
  ): any {
    try {
      const matches = findTextInDocument(sfdtObject, clauseText);

      if (matches.length === 0) {
        return null;
      }

      const match = matches[0];

      const path = match.path;
      let sectionIndex = -1;
      let paragraphIndex = -1;

      for (let i = 0; i < path.length; i++) {
        if (path[i] === 'sec' && i + 1 < path.length) {
          sectionIndex = parseInt(path[i + 1]);
        }

        if (path[i] === 'b' && i + 1 < path.length) {
          paragraphIndex = parseInt(path[i + 1]);
          break;
        }
      }

      if (sectionIndex === -1 || paragraphIndex === -1) {
        return null;
      }

      return {
        sectionIndex,
        paragraphIndex,
        match,
      };
    } catch (error) {
      console.error('Error identifying clause in document:', error);
      return null;
    }
  }

  private static removeClauseWithInfo(sfdtObject: any, clauseInfo: any): any {
    try {
      const updatedSfdt = JSON.parse(JSON.stringify(sfdtObject));

      const { sectionIndex, paragraphIndex } = clauseInfo;

      if (
        !updatedSfdt.sec[sectionIndex] ||
        !updatedSfdt.sec[sectionIndex].b ||
        paragraphIndex >= updatedSfdt.sec[sectionIndex].b.length
      ) {
        console.error('Invalid section or paragraph index');
        return updatedSfdt;
      }

      updatedSfdt.sec[sectionIndex].b.splice(paragraphIndex, 1);

      return updatedSfdt;
    } catch (error) {
      console.error('Error removing clause from document:', error);
      return sfdtObject;
    }
  }
}

export const removeClauseUsingEditor = (
  documentEditor: any,
  clauseToRemove: any
): boolean => {
  try {
    if (!documentEditor) {
      console.error('Document editor reference is missing');
      return false;
    }

    const searchModule = documentEditor.search;
    const editorModule = documentEditor.editor;

    const clauseInitialText = clauseToRemove.initial;

    searchModule.clearSearchHighlight();

    searchModule.findAll(clauseInitialText, {
      matchCase: false,
      wholeWord: false,
    });

    if (searchModule.searchResults && searchModule.searchResults.length > 0) {
      searchModule.currentSearchResultIndex = 0;

      const selection = documentEditor.selection;
      selection.selectParagraphByIndex(selection.startParagraphIndex);

      editorModule.delete();

      return true;
    }

    console.warn('Could not find clause text in document');
    return false;
  } catch (error) {
    console.error('Error removing clause using editor:', error);
    return false;
  }
};
