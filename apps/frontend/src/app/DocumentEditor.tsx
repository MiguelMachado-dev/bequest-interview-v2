import {
  DocumentEditorContainerComponent,
  Toolbar,
  Selection,
  Editor,
  ContextMenu,
  EditorHistory,
  Search,
} from '@syncfusion/ej2-react-documenteditor';

DocumentEditorContainerComponent.Inject(
  Toolbar,
  Selection,
  Editor,
  ContextMenu,
  EditorHistory,
  Search
);

import { registerLicense } from '@syncfusion/ej2-base';
import { useEffect, useRef, useState } from 'react';
import { useClauses } from '../hooks/use-clauses';
import { useDocument } from '../hooks/use-document';
import debounce from 'lodash.debounce';
import { CLAUSES } from '../utils/constants';
import {
  DocumentService,
  removeClauseUsingEditor,
} from '../utils/document-service';

registerLicense(
  'Ngo9BigBOggjHTQxAR8/V1NMaF1cXmhNYVJ2WmFZfVtgdV9DZVZUTGYuP1ZhSXxWdkZiWH9fdXJVR2BaWEE='
);

export const DocumentEditor = () => {
  const { document, save, loaded } = useDocument();
  const { clauses, setClauses, addClause, removeClause } = useClauses();
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
  const [isProcessingClause, setIsProcessingClause] = useState(false);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [removalSuccess, setRemovalSuccess] = useState<{
    id: string;
    success: boolean;
  } | null>(null);

  const saveDocumentWithDebounce = debounce(() => {
    if (containerRef.current && !isProcessingClause && document) {
      const currentContent = containerRef.current.documentEditor.serialize();

      save({
        ...document,
        name: document.name || '',
        content: currentContent,
        clauses: clauses.map((clause) => clause.id).join(','),
      });
    }
  }, 1000);

  const handleContentChange = () => {
    if (!isProcessingClause) {
      saveDocumentWithDebounce();
    }
  };

  const updatePlaceholders = () => {
    if (containerRef.current) {
      const currentContent = containerRef.current.documentEditor.serialize();
      const identifiedPlaceholders =
        DocumentService.identifyPlaceholders(currentContent);
      setPlaceholders(identifiedPlaceholders);
    }
  };

  const addClauseToDocument = (clause: any) => {
    if (!containerRef.current || !document) return;

    setIsProcessingClause(true);

    try {
      const currentContent = containerRef.current.documentEditor.serialize();

      const updatedContent = DocumentService.addClauseToDocument(
        currentContent,
        clause
      );

      containerRef.current.documentEditor.open(updatedContent);

      const updatedClause = { ...clause, added: true };
      addClause(updatedClause);

      save({
        ...document,
        content: updatedContent,
        clauses: [
          ...clauses.map((c) => c.id).filter((id) => id !== clause.id),
          updatedClause.id,
        ].join(','),
      });

      updatePlaceholders();
    } catch (error) {
      console.error('Error adding clause to document:', error);
    } finally {
      setIsProcessingClause(false);
    }
  };

  const removeClauseFromDocument = (clauseId: string) => {
    if (!containerRef.current || !document) return;

    const clauseToRemove = clauses.find((clause) => clause.id === clauseId);
    if (!clauseToRemove) return;

    setIsProcessingClause(true);

    try {
      const success = removeClauseUsingEditor(
        containerRef.current.documentEditor,
        clauseToRemove
      );

      if (!success) {
        const currentContent = containerRef.current.documentEditor.serialize();

        const updatedContent = DocumentService.removeClauseFromDocument(
          currentContent,
          clauseToRemove
        );

        containerRef.current.documentEditor.open(updatedContent);
      }

      setRemovalSuccess({ id: clauseId, success: true });

      removeClause(clauseId);

      save({
        ...document,
        content: containerRef.current.documentEditor.serialize(),
        clauses: clauses
          .filter((c) => c.id !== clauseId)
          .map((c) => c.id)
          .join(','),
      });

      updatePlaceholders();
    } catch (error) {
      console.error('Error removing clause from document:', error);
      setRemovalSuccess({ id: clauseId, success: false });
    } finally {
      setIsProcessingClause(false);

      setTimeout(() => {
        setRemovalSuccess(null);
      }, 3000);
    }
  };

  useEffect(() => {
    if (loaded && containerRef.current && document) {
      containerRef.current.documentEditor.open(document.content);

      const documentClauses = document.clauses
        ? document.clauses.split(',')
        : [];
      const clauseItems = CLAUSES.filter((c) =>
        documentClauses.includes(c.id)
      ).map((c) => ({ ...c, added: true }));

      setClauses(clauseItems);

      updatePlaceholders();
    }
  }, [loaded, document]);

  useEffect(() => {
    const unaddedClauses = clauses.filter((c) => c.added === false);

    if (unaddedClauses.length && containerRef.current) {
      unaddedClauses.forEach((clause) => {
        addClauseToDocument(clause);
      });
    }
  }, [clauses]);

  useEffect(() => {
    window.removeClauseFromDocument = removeClauseFromDocument;

    return () => {
      delete window.removeClauseFromDocument;
    };
  }, [clauses, document]);

  return (
    <div className="flex flex-col min-h-screen">
      {placeholders.length > 0 && (
        <div className="bg-blue-50 p-2 border-b border-blue-200 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-600 mr-2">
              Document Placeholders:
            </span>
            <div className="flex flex-wrap gap-2">
              {placeholders.map((placeholder, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {placeholder}
                </span>
              ))}
            </div>
          </div>
          <button
            className="text-xs text-blue-600 hover:text-blue-800"
            onClick={() => updatePlaceholders()}
          >
            Refresh
          </button>
        </div>
      )}

      {removalSuccess && (
        <div
          className={`p-2 text-center text-sm ${
            removalSuccess.success
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {removalSuccess.success
            ? 'Clause successfully removed from document'
            : 'Error removing clause from document - please try again'}
        </div>
      )}

      <div className="flex-1 bg-background">
        <DocumentEditorContainerComponent
          height="calc(100vh - 50px)"
          ref={containerRef}
          serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
          enableToolbar={true}
          showPropertiesPane={false}
          contentChange={handleContentChange}
          documentChange={updatePlaceholders}
          toolbarItems={[
            'New',
            'Open',
            'Separator',
            'Undo',
            'Redo',
            'Separator',
            'Bookmark',
            'Table',
            'Separator',
            'Find',
            'Comments',
            'TrackChanges',
            'Separator',
            'LocalClipboard',
            'RestrictEditing',
          ]}
        />
      </div>
    </div>
  );
};
