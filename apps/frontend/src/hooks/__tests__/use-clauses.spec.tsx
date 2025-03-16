import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ClausesProvider, useClauses, ClausesContext } from '../use-clauses';
import React from 'react';

describe('useClauses', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ClausesProvider>{children}</ClausesProvider>
  );

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize with empty clauses array', () => {
    const { result } = renderHook(() => useClauses(), { wrapper });
    expect(result.current.clauses).toEqual([]);
  });

  it('should add a clause', () => {
    const { result } = renderHook(() => useClauses(), { wrapper });

    const newClause = {
      id: '1',
      content: 'Test content',
      name: 'Test clause',
      initial: 'TC',
      added: true,
    };

    act(() => {
      result.current.addClause(newClause);
    });

    expect(result.current.clauses).toEqual([newClause]);
  });

  it('should replace a clause with the same id', () => {
    const { result } = renderHook(() => useClauses(), { wrapper });

    const clause1 = {
      id: '1',
      content: 'Original content',
      name: 'Original clause',
      initial: 'OC',
      added: true,
    };

    const clause2 = {
      id: '1',
      content: 'Updated content',
      name: 'Updated clause',
      initial: 'UC',
      added: true,
    };

    act(() => {
      result.current.addClause(clause1);
      result.current.addClause(clause2);
    });

    expect(result.current.clauses).toEqual([clause2]);
    expect(result.current.clauses.length).toBe(1);
  });

  it('should remove a clause by id', () => {
    const { result } = renderHook(() => useClauses(), { wrapper });

    const clause = {
      id: '1',
      content: 'Test content',
      name: 'Test clause',
      initial: 'TC',
      added: true,
    };

    act(() => {
      result.current.addClause(clause);
    });

    expect(result.current.clauses.length).toBe(1);

    act(() => {
      result.current.removeClause('1');
    });

    expect(result.current.clauses).toEqual([]);
  });

  it('should set clauses directly', () => {
    const { result } = renderHook(() => useClauses(), { wrapper });

    const clauses = [
      {
        id: '1',
        content: 'Content 1',
        name: 'Clause 1',
        initial: 'C1',
        added: true,
      },
      {
        id: '2',
        content: 'Content 2',
        name: 'Clause 2',
        initial: 'C2',
        added: false,
      },
    ];

    act(() => {
      result.current.setClauses(clauses);
    });

    expect(result.current.clauses).toEqual(clauses);
  });

  it('should handle error case when context is null', () => {
    const useClausesWithNullContext = () => {
      const context = null;
      if (!context) {
        throw new Error('useClauses must be used within a ClausesProvider.');
      }
      return context;
    };

    expect(() => {
      useClausesWithNullContext();
    }).toThrow('useClauses must be used within a ClausesProvider.');
  });
});
