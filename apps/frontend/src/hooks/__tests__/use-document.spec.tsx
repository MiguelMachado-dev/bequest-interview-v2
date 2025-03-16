import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DocumentProvider, useDocument } from '../use-document';
import React from 'react';

global.fetch = vi.fn();

describe('useDocument', () => {
  const mockDocument = {
    id: 1,
    name: 'Test Document',
    content: 'Test content',
    clauses: 'Test clauses',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DocumentProvider>{children}</DocumentProvider>
  );

  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should fetch document on mount', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocument,
    });

    const { result } = renderHook(() => useDocument(), { wrapper });

    expect(result.current.loaded).toBe(false);
    expect(result.current.document).toBe(null);

    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(result.current.document).toEqual(mockDocument);
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/documents/1'
    );
  });

  it('should create a new document if none exists', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocument,
    });

    const { result } = renderHook(() => useDocument(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      'http://localhost:3000/api/documents/1'
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/documents',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Untitled Document',
          content: '',
          clauses: '',
        }),
      }
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      3,
      'http://localhost:3000/api/documents/1'
    );
    expect(result.current.document).toEqual(mockDocument);
  });

  it('should handle fetch errors gracefully', async () => {
    const fetchError = new Error('Network error');
    (global.fetch as any).mockRejectedValueOnce(fetchError);

    const { result } = renderHook(() => useDocument(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(console.error).toHaveBeenCalledWith(
      'Failed to fetch document',
      fetchError
    );

    expect(result.current.document).toBe(null);
    expect(result.current.loaded).toBe(false);
  });

  it('should save document', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocument,
    });

    const updatedDocument = { ...mockDocument, content: 'Updated content' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => updatedDocument,
    });

    const { result } = renderHook(() => useDocument(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    act(() => {
      result.current.save(updatedDocument);
    });

    await waitFor(() => expect(result.current.isSaving).toBe(false));

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      'http://localhost:3000/api/documents/1',
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDocument),
      }
    );
    expect(result.current.document).toEqual(updatedDocument);
  });

  it('should update document with setDocument', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockDocument,
    });

    const { result } = renderHook(() => useDocument(), { wrapper });

    await waitFor(() => expect(result.current.loaded).toBe(true));

    const updatedDocument = { ...mockDocument, name: 'Updated Name' };

    act(() => {
      result.current.setDocument(updatedDocument);
    });

    expect(result.current.document).toEqual(updatedDocument);
  });

  it('should throw error when used outside provider', () => {
    expect(() => {
      renderHook(() => useDocument());
    }).toThrow('useDocumentContext must be used within a DocumentProvider');
  });
});
