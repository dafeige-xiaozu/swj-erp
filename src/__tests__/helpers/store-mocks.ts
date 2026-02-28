import { useAppStore } from '@/lib/store'

/**
 * 重置 Store 到初始 mock 数据状态
 */
export function resetStore() {
  // Zustand persist 会在 localStorage 读取数据
  // 清除 localStorage 后 destroy 并重新创建 store
  localStorage.clear()
  useAppStore.setState(useAppStore.getInitialState())
}

/**
 * 获取当前 Store 快照
 */
export function getStoreSnapshot() {
  return useAppStore.getState()
}
