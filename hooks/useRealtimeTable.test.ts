import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useRealtimeTable } from './useRealtimeTable'
import { createClient } from '@/utils/supabase/client'

// Mock Supabase client
vi.mock('@/utils/supabase/client', () => {
  let storedCallback: any = null

  const mockOn = vi.fn((event, filter, callback) => {
    if (event === 'postgres_changes') {
      storedCallback = callback
    }
    return mockChannel
  })
  const mockSubscribe = vi.fn(() => mockChannel)
  const mockRemoveChannel = vi.fn()

  const mockChannel = {
    on: mockOn,
    subscribe: mockSubscribe,
    triggerPostgresChanges: (payload: any) => {
      if (storedCallback) {
        storedCallback(payload)
      }
    },
  }

  const mockSupabaseClient = {
    channel: vi.fn(() => mockChannel),
    removeChannel: mockRemoveChannel,
  }

  return {
    createClient: vi.fn(() => mockSupabaseClient),
  }
})

describe('useRealtimeTable', () => {
  it('should initialize with initial data', () => {
    const initialData = [{ id: 1, name: 'Test 1' }]
    const { result } = renderHook(() =>
      useRealtimeTable('test_table', initialData),
    )
    expect(result.current[0]).toEqual(initialData)
  })

  it('should handle INSERT events', () => {
    const initialData: { id: number; name: string }[] = []
    const { result } = renderHook(() =>
      useRealtimeTable('test_table', initialData),
    )

    const newRow = { id: 1, name: 'New Item' }
    act(() => {
      const supabase = createClient()
      const channel = supabase.channel('test_table_channel') as any
      channel.triggerPostgresChanges({
        eventType: 'INSERT',
        new: newRow,
        old: {},
        errors: [],
        schema: 'public',
        table: 'test_table',
      })
    })

    expect(result.current[0]).toEqual([newRow])
  })

  it('should handle UPDATE events', () => {
    const initialData = [{ id: 1, name: 'Test 1' }]
    const { result } = renderHook(() =>
      useRealtimeTable('test_table', initialData),
    )

    const updatedRow = { id: 1, name: 'Updated Test 1' }
    act(() => {
      const supabase = createClient()
      const channel = supabase.channel('test_table_channel') as any
      channel.triggerPostgresChanges({
        eventType: 'UPDATE',
        new: updatedRow,
        old: { id: 1, name: 'Test 1' },
        errors: [],
        schema: 'public',
        table: 'test_table',
      })
    })

    expect(result.current[0]).toEqual([updatedRow])
  })

  it('should handle DELETE events', () => {
    const initialData = [{ id: 1, name: 'Test 1' }]
    const { result } = renderHook(() =>
      useRealtimeTable('test_table', initialData),
    )

    const deletedRow = { id: 1, name: 'Test 1' }
    act(() => {
      const supabase = createClient()
      const channel = supabase.channel('test_table_channel') as any
      channel.triggerPostgresChanges({
        eventType: 'DELETE',
        new: {},
        old: deletedRow,
        errors: [],
        schema: 'public',
        table: 'test_table',
      })
    })

    expect(result.current[0]).toEqual([])
  })

  it('should call onInsert callback', () => {
    const onInsert = vi.fn()
    const initialData: { id: number; name: string }[] = []
    renderHook(() =>
      useRealtimeTable('test_table', initialData, { onInsert }),
    )

    const newRow = { id: 1, name: 'New Item' }
    act(() => {
      const supabase = createClient()
      const channel = supabase.channel('test_table_channel') as any
      channel.triggerPostgresChanges({
        eventType: 'INSERT',
        new: newRow,
        old: {},
        errors: [],
        schema: 'public',
        table: 'test_table',
      })
    })

    expect(onInsert).toHaveBeenCalledWith(newRow)
  })

  it('should call onUpdate callback', () => {
    const onUpdate = vi.fn()
    const initialData = [{ id: 1, name: 'Test 1' }]
    renderHook(() =>
      useRealtimeTable('test_table', initialData, { onUpdate }),
    )

    const updatedRow = { id: 1, name: 'Updated Test 1' }
    act(() => {
      const supabase = createClient()
      const channel = supabase.channel('test_table_channel') as any
      channel.triggerPostgresChanges({
        eventType: 'UPDATE',
        new: updatedRow,
        old: { id: 1, name: 'Test 1' },
        errors: [],
        schema: 'public',
        table: 'test_table',
      })
    })

    expect(onUpdate).toHaveBeenCalledWith(updatedRow)
  })

  it('should call onDelete callback', () => {
    const onDelete = vi.fn()
    const initialData = [{ id: 1, name: 'Test 1' }]
    renderHook(() =>
      useRealtimeTable('test_table', initialData, { onDelete }),
    )

    const deletedRow = { id: 1, name: 'Test 1' }
    act(() => {
      const supabase = createClient()
      const channel = supabase.channel('test_table_channel') as any
      channel.triggerPostgresChanges({
        eventType: 'DELETE',
        new: {},
        old: deletedRow,
        errors: [],
        schema: 'public',
        table: 'test_table',
      })
    })

    expect(onDelete).toHaveBeenCalledWith(deletedRow)
  })
})