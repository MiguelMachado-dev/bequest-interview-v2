export const parseSfdtContent = (sfdtContent: string) => {
  try {
    return JSON.parse(sfdtContent);
  } catch (error) {
    console.error('Error parsing SFDT content:', error);
    return null;
  }
};

export const serializeSfdtContent = (sfdtObject: any) => {
  try {
    return JSON.stringify(sfdtObject);
  } catch (error) {
    console.error('Error serializing SFDT content:', error);
    return '';
  }
};

export const findPlaceholders = (sfdtObject: any) => {
  const placeholders: any[] = [];

  const searchForPlaceholders = (obj: any, path: string[] = []) => {
    if (!obj) return;

    if (typeof obj === 'object') {
      if (
        obj.tlp &&
        typeof obj.tlp === 'string' &&
        obj.tlp.includes('{') &&
        obj.tlp.includes('}')
      ) {
        placeholders.push({
          element: obj,
          path: [...path],
          placeholder: obj.tlp,
        });
      }

      Object.entries(obj).forEach(([key, value]) => {
        const newPath = [...path, key];

        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            searchForPlaceholders(item, [...newPath, index.toString()]);
          });
        } else if (typeof value === 'object' && value !== null) {
          searchForPlaceholders(value, newPath);
        }
      });
    }
  };

  searchForPlaceholders(sfdtObject);
  return placeholders;
};

export const extractPlaceholderName = (placeholderText: string) => {
  const match = placeholderText.match(/{([^}]+)}/);
  return match ? match[1] : null;
};

export const findPlaceholderByName = (
  sfdtObject: any,
  placeholderName: string
) => {
  const placeholders = findPlaceholders(sfdtObject);
  return (
    placeholders.find(
      (p) => extractPlaceholderName(p.placeholder) === placeholderName
    ) || null
  );
};

export const findSections = (sfdtObject: any) => {
  if (!sfdtObject || !sfdtObject.sec || !Array.isArray(sfdtObject.sec)) {
    return [];
  }

  return sfdtObject.sec;
};

export const findParagraphs = (sfdtObject: any) => {
  const paragraphs: any[] = [];

  const processSection = (section: any, sectionIndex: number) => {
    if (!section || !section.b || !Array.isArray(section.b)) return;

    section.b.forEach((block: any, blockIndex: number) => {
      if (block.pf) {
        paragraphs.push({
          paragraph: block,
          path: ['sec', sectionIndex, 'b', blockIndex],
        });
      }
    });
  };

  if (sfdtObject && sfdtObject.sec && Array.isArray(sfdtObject.sec)) {
    sfdtObject.sec.forEach((section: any, index: number) => {
      processSection(section, index);
    });
  }

  return paragraphs;
};

export const findTextInDocument = (sfdtObject: any, searchText: string) => {
  const matches: any[] = [];

  const searchInBlock = (block: any, path: string[] = []) => {
    if (!block || !block.i || !Array.isArray(block.i)) return;

    block.i.forEach((item: any, index: number) => {
      if (
        item.tlp &&
        typeof item.tlp === 'string' &&
        item.tlp.includes(searchText)
      ) {
        matches.push({
          element: item,
          path: [...path, 'i', index.toString()],
          text: item.tlp,
        });
      }
    });
  };

  const paragraphs = findParagraphs(sfdtObject);
  paragraphs.forEach((p) => {
    searchInBlock(p.paragraph, p.path);
  });

  return matches;
};

export const insertContentAtPath = (
  sfdtObject: any,
  path: string[],
  content: any
) => {
  const updatedSfdt = JSON.parse(JSON.stringify(sfdtObject));

  let current = updatedSfdt;
  for (let i = 0; i < path.length - 1; i++) {
    if (current[path[i]] === undefined) return updatedSfdt;
    current = current[path[i]];
  }

  const lastKey = path[path.length - 1];
  current[lastKey] = content;

  return updatedSfdt;
};

export const replacePlaceholderWithClause = (
  sfdtObject: any,
  placeholder: any,
  clauseContent: string
) => {
  try {
    const clauseSfdt = parseSfdtContent(clauseContent);
    if (!clauseSfdt) return sfdtObject;

    const clauseSections = findSections(clauseSfdt);
    if (clauseSections.length === 0) return sfdtObject;

    let clauseParagraphs: any[] = [];
    clauseSections.forEach((section: any, sectionIndex: number) => {
      if (section.b && Array.isArray(section.b)) {
        clauseParagraphs = clauseParagraphs.concat(
          section.b.map((block: any) => ({ ...block }))
        );
      }
    });

    if (clauseParagraphs.length === 0) return sfdtObject;

    const updatedSfdt = JSON.parse(JSON.stringify(sfdtObject));

    const placeholders = findPlaceholders(updatedSfdt);
    const targetPlaceholder = placeholders.find(
      (p) => p.placeholder === placeholder.placeholder
    );

    if (!targetPlaceholder) return updatedSfdt;

    let current = updatedSfdt;
    const pathToPlaceholder = targetPlaceholder.path.slice(0, -2);

    for (const pathPart of pathToPlaceholder) {
      current = current[pathPart];
      if (!current) return updatedSfdt;
    }

    const paragraphIndex = parseInt(
      targetPlaceholder.path[targetPlaceholder.path.length - 2]
    );
    const sectionIndex = parseInt(targetPlaceholder.path[0]);

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
};

export const identifyClauseInDocument = (
  sfdtObject: any,
  clauseIdentifier: string
) => {
  const matches = findTextInDocument(sfdtObject, clauseIdentifier);

  if (matches.length === 0) return null;

  const match = matches[0];

  const pathParts = match.path.slice(0, -2);
  let paragraphIndex = parseInt(pathParts[pathParts.length - 1]);
  let sectionIndex = parseInt(pathParts[0]);

  return {
    startSectionIndex: sectionIndex,
    startParagraphIndex: paragraphIndex,
    match: match,
  };
};

export const removeClauseFromDocument = (sfdtObject: any, clauseInfo: any) => {
  if (!clauseInfo) return sfdtObject;

  try {
    const updatedSfdt = JSON.parse(JSON.stringify(sfdtObject));

    const { startSectionIndex, startParagraphIndex } = clauseInfo;

    updatedSfdt.sec[startSectionIndex].b.splice(startParagraphIndex, 1);

    return updatedSfdt;
  } catch (error) {
    console.error('Error removing clause from document:', error);
    return sfdtObject;
  }
};
