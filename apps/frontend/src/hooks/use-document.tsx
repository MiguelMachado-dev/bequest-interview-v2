import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface Document {
  id: number;
  name: string;
  content: string;
  clauses: string;
}

interface DocumentContextProps {
  id: number;
  document: Document | null;
  save: (document: Document) => Promise<void>;
  isSaving: boolean;
  loaded: boolean;
  setDocument: (document: Document) => void;
}

const DocumentContext = createContext<DocumentContextProps | undefined>(
  undefined
);

export const DocumentProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const id = 1;
  const [loaded, setLoaded] = useState(false);
  const [document, setDocument] = useState<Document | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchDocument = useCallback(async () => {
    setLoaded(false);
    try {
      let response = await fetch(`http://localhost:3000/api/documents/${id}`);

      if (!response.ok) {
        await fetch(`http://localhost:3000/api/documents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Untitled Document',
            content: '',
            clauses: '',
          }),
        });

        response = await fetch(`http://localhost:3000/api/documents/${id}`);
      }

      const data = await response.json();
      setDocument(data);
      setLoaded(true);
    } catch (error) {
      console.error('Failed to fetch document', error);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  const save = async (doc: Document) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `http://localhost:3000/api/documents/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(doc),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setDocument(data);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DocumentContext.Provider
      value={{ document, save, isSaving, loaded, id, setDocument }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocument = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error(
      'useDocumentContext must be used within a DocumentProvider'
    );
  }
  return context;
};
