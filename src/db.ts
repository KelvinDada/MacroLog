export const DATABASE_NAME = 'macrolog-db'
export const DATABASE_VERSION = 1

export type Goals = {
  calories: number
  carbohydrates: number
  protein: number
  fat: number
}

const DEFAULT_GOALS: Goals = {
  calories: 2073,
  carbohydrates: 223,
  protein: 166,
  fat: 58,
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION)
    request.onupgradeneeded = () => {
      const database = request.result
      if (!database.objectStoreNames.contains('entries')) database.createObjectStore('entries', { keyPath: 'id' })
      if (!database.objectStoreNames.contains('settings')) database.createObjectStore('settings', { keyPath: 'key' })
    }
    request.onsuccess = () => {
      const database = request.result
      database.onversionchange = () => database.close()
      resolve(database)
    }
    request.onerror = () => reject(request.error ?? new Error('No se pudo abrir IndexedDB.'))
    request.onblocked = () => reject(new Error('La base está ocupada por otra pestaña. Cierra otras pestañas de MacroLog e inténtalo de nuevo.'))
  })
}

export function loadOrCreateGoals(database: IDBDatabase): Promise<Goals> {
  return new Promise((resolve, reject) => {
    const transaction = database.transaction('settings', 'readwrite')
    const store = transaction.objectStore('settings')
    const request = store.get('goals')
    let result = DEFAULT_GOALS
    request.onsuccess = () => {
      const stored = request.result?.value as Goals | undefined
      if (stored && isGoals(stored)) result = stored
      else store.put({ key: 'goals', value: DEFAULT_GOALS })
    }
    request.onerror = () => transaction.abort()
    transaction.oncomplete = () => resolve(result)
    transaction.onerror = () => reject(transaction.error ?? new Error('No se pudieron cargar los objetivos.'))
    transaction.onabort = () => reject(transaction.error ?? new Error('No se pudieron guardar los objetivos iniciales.'))
  })
}

function isGoals(value: Goals): boolean {
  return ['calories', 'carbohydrates', 'protein', 'fat'].every((key) => {
    const amount = value[key as keyof Goals]
    return Number.isFinite(amount) && amount >= 0
  })
}
