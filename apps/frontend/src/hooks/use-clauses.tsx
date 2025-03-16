import React, { useContext, createContext, useState } from 'react';

type Clause = {
  id: string;
  content: string;
  name: string;
  initial: string;
  added: boolean;
};

type ClausesContextType = {
  clauses: Clause[];
  addClause: (clause: Clause) => void;
  removeClause: (id: string) => void;
  setClauses: (clauses: Clause[]) => void;
};

export const ClausesContext = createContext<ClausesContextType>({
  clauses: [],
  addClause: () => {},
  removeClause: () => {},
  setClauses: () => {},
});

type ClausesProviderProps = {
  children: React.ReactNode;
};

export const ClausesProvider = ({ children }: ClausesProviderProps) => {
  const [clauses, setClauses] = useState<Clause[]>([]);

  const addClause = (clause: Clause) => {
    setClauses([...clauses.filter((c) => c.id !== clause.id), clause]);
  };

  const removeClause = (id: string) => {
    setClauses(clauses.filter((c) => c.id !== id));
  };

  return (
    <ClausesContext.Provider
      value={{ clauses, addClause, removeClause, setClauses }}
    >
      {children}
    </ClausesContext.Provider>
  );
};

export const useClauses = () => {
  const context = useContext(ClausesContext);
  if (!context) {
    throw new Error('useClauses must be used within a ClausesProvider.');
  }
  return context;
};
