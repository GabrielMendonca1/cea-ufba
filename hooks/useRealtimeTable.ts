
import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useRealtimeTable<T>(
  table: string,
  initialData: T[],
  opts?: {
    primaryKey?: string
    filter?: string
    onInsert?: (newItem: T) => void
    onUpdate?: (updatedItem: T) => void
    onDelete?: (deletedItem: T) => void
  },
) {
  const [data, setData] = useState<T[]>(initialData)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const primaryKey = opts?.primaryKey || 'id'

  // Fetch initial data
  useEffect(() => {
    async function fetchInitialData() {
      try {
        let query = supabase.from(table).select('*')
        
        if (opts?.filter) {
          const [column, operator, value] = opts.filter.split(/[=.]+/)
          if (operator === 'eq') {
            query = query.eq(column, value)
          }
        }
        
        const { data: fetchedData, error } = await query
        
        if (error) {
          console.error(`Error fetching initial data for ${table}:`, error)
        } else if (fetchedData) {
          setData(fetchedData as T[])
        }
      } catch (error) {
        console.error(`Error in fetchInitialData for ${table}:`, error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()
  }, [table, opts?.filter, supabase])

  useEffect(() => {
    const channel = supabase
      .channel(`${table}_channel`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: opts?.filter,
        },
        (payload) => {
          const newItem = payload.new as T
          const oldItem = payload.old as T

          switch (payload.eventType) {
            case 'INSERT':
              setData((prev) => {
                const exists = prev.some(
                  (item) => item[primaryKey as keyof T] === newItem[primaryKey as keyof T],
                )
                if (!exists) {
                  opts?.onInsert?.(newItem)
                  return [...prev, newItem]
                }
                return prev
              })
              break
            case 'UPDATE':
              setData((prev) => {
                opts?.onUpdate?.(newItem)
                return prev.map((item) =>
                  item[primaryKey as keyof T] === newItem[primaryKey as keyof T]
                    ? newItem
                    : item,
                )
              })
              break
            case 'DELETE':
              setData((prev) => {
                opts?.onDelete?.(oldItem)
                return prev.filter(
                  (item) => item[primaryKey as keyof T] !== oldItem[primaryKey as keyof T],
                )
              })
              break
            default:
              break
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, primaryKey, opts?.filter, opts?.onInsert, opts?.onUpdate, opts?.onDelete, supabase])

  return [data, setData, isLoading] as const
}
