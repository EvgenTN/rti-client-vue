import { ref } from 'vue'

type Toast = { id: number; message: string; type: 'success' | 'error' }

const toasts = ref<Toast[]>([])
let nextId = 1

export function useToast() {
  function show(message: string, type: Toast['type'] = 'success', ttl = 4000) {
    const id = nextId++
    toasts.value.push({ id, message, type })
    if (ttl > 0) setTimeout(() => remove(id), ttl)
    return id
  }

  function remove(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, show, remove }
}

export default useToast
