'use client'

import { useEffect } from 'react'
import { initializeData } from '@/lib/data'

export function DataInitializer() {
  useEffect(() => {
    initializeData()
  }, [])
  
  return null
}
