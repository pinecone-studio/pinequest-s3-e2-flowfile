export function getAll<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(key)
  return data ? JSON.parse(data) : []
}

export function getById<T extends { id: string }>(key: string, id: string): T | undefined {
  const items = getAll<T>(key)
  return items.find(item => item.id === id)
}

export function save<T extends { id: string }>(key: string, item: T): void {
  const items = getAll<T>(key)
  const existingIndex = items.findIndex(i => i.id === item.id)
  if (existingIndex >= 0) {
    items[existingIndex] = item
  } else {
    items.push(item)
  }
  localStorage.setItem(key, JSON.stringify(items))
}

export function update<T extends { id: string }>(key: string, id: string, patch: Partial<T>): void {
  const items = getAll<T>(key)
  const index = items.findIndex(i => i.id === id)
  if (index >= 0) {
    items[index] = { ...items[index], ...patch }
    localStorage.setItem(key, JSON.stringify(items))
  }
}

export function remove(key: string, id: string): void {
  const items = getAll<{ id: string }>(key)
  const filtered = items.filter(i => i.id !== id)
  localStorage.setItem(key, JSON.stringify(filtered))
}
