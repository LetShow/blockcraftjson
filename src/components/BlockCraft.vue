<script setup>
import { ref, computed, watch } from 'vue'
import BlockItem from './BlockItem.vue'

const props = defineProps({
  block: {
    type: Object,
    default: () => ({ block: [], subBlock: [] })
  },
  theme: {
    type: Object,
    default: () => ({})
  },
  authority: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'change', 'themeChange'])

const toggleTheme = () => {
  localIsDark.value = !localIsDark.value
  emit('themeChange', localIsDark.value)
}

const darkTheme = {
  blockColor: '#2d5a8a',
  blockTextColor: '#ffffff',
  canvasBg: '#1e1e1e',
  errorBg: '#4a2020',
  buttonColor: '#2d5a8a',
  buttonTextColor: '#ffffff'
}

const defaultTheme = {
  blockColor: '#f0f0f0',
  blockTextColor: '#333333',
  canvasBg: '#ffffff',
  errorBg: '#fff0f0',
  buttonColor: '#1890ff',
  buttonTextColor: '#ffffff'
}

const defaultAuthority = {
  showImport: true,
  showExport: true,
  showPreview: true,
  showConfig: true
}

const localIsDark = ref(false)

const mergedTheme = computed(() => ({ 
  ...(localIsDark.value ? darkTheme : defaultTheme), 
  ...props.theme 
}))
const mergedAuthority = computed(() => ({ ...defaultAuthority, ...props.authority }))

const fieldBlocks = ref([])
const fileInput = ref(null)

const previewVisible = ref(false)

const initBlocks = () => {
  if (props.block?.block) {
    fieldBlocks.value = props.block.block.map(b => ({
      ...b,
      value: props.modelValue?.[b.key] ?? getDefaultValue(b),
      id: Math.random().toString(36).substr(2, 9)
    }))
  }
}

const getDefaultValue = (block) => {
  switch (block.type) {
    case 'number': return 0
    case 'checkbox': return []
    case 'array': return []
    case 'keyvalue': return []
    default: return ''
  }
}

const addBlock = (blockConfig) => {
  if (blockConfig.unique && fieldBlocks.value.some(b => b.key === blockConfig.key)) {
    return
  }
  fieldBlocks.value.push({
    ...blockConfig,
    value: getDefaultValue(blockConfig),
    id: Math.random().toString(36).substr(2, 9)
  })
}

const removeBlock = (index) => {
  fieldBlocks.value.splice(index, 1)
}

const updateBlockValue = (id, value) => {
  const block = fieldBlocks.value.find(b => b.id === id)
  if (block) {
    block.value = value
    emitChange()
  }
}

const emitChange = () => {
  const result = {}
  fieldBlocks.value.forEach(block => {
    result[block.key] = block.value
  })
  emit('update:modelValue', result)
  emit('change', result)
}

const getJsonData = () => {
  const result = {}
  fieldBlocks.value.forEach(block => {
    result[block.key] = block.value
  })
  return result
}

const handleExport = () => {
  const data = getJsonData()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'blockcraft-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

const handleImport = () => {
  fileInput.value?.click()
}

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result)
      fieldBlocks.value.forEach(block => {
        if (data.hasOwnProperty(block.key)) {
          const rawValue = data[block.key]
          if (block.type === 'keyvalue') {
            block.value = convertToKeyValueArray(rawValue)
          } else {
            block.value = rawValue
          }
        }
      })
      emitChange()
    } catch (err) {
      console.error('Invalid JSON file')
    }
  }
  reader.readAsText(file)
  event.target.value = ''
}

const convertToKeyValueArray = (obj) => {
  if (!obj || typeof obj !== 'object') return []
  if (Array.isArray(obj)) return obj
  return Object.entries(obj).map(([key, value]) => ({ key, value: String(value) }))
}

const handlePreview = () => {
  previewVisible.value = true
}

const availableBlocks = computed(() => {
  const usedKeys = fieldBlocks.value.map(b => b.key)
  return props.block?.block?.filter(b => !usedKeys.includes(b.key)) || []
})

const dragIndex = ref(-1)
const dragOverIndex = ref(-1)

const handleDragStart = (index) => {
  dragIndex.value = index
}

const handleDragOver = (index) => {
  dragOverIndex.value = index
}

const handleDrop = (index) => {
  if (dragIndex.value === -1) return
  const item = fieldBlocks.value[dragIndex.value]
  fieldBlocks.value.splice(dragIndex.value, 1)
  fieldBlocks.value.splice(index, 0, item)
  dragIndex.value = -1
  dragOverIndex.value = -1
}

const handleDragEnd = () => {
  dragIndex.value = -1
  dragOverIndex.value = -1
}

const trashIndex = ref(-1)

const handleDragOverTrash = (e) => {
  e.preventDefault()
  trashIndex.value = dragIndex.value
}

const handleDropTrash = () => {
  if (dragIndex.value !== -1) {
    fieldBlocks.value.splice(dragIndex.value, 1)
    emitChange()
  }
  trashIndex.value = -1
  dragIndex.value = -1
  dragOverIndex.value = -1
}

const handleDragLeaveTrash = () => {
  trashIndex.value = -1
}

initBlocks()

watch(() => props.block, initBlocks, { deep: true })

watch(() => props.modelValue, (newVal) => {
  console.log('[BlockCraft] modelValue变化:', JSON.stringify(newVal)?.slice(0, 200));
  if (!newVal) return;
  if (fieldBlocks.value.length > 0) {
    fieldBlocks.value.forEach(block => {
      if (newVal.hasOwnProperty(block.key)) {
        console.log('[BlockCraft] 更新block:', block.key, 'type:', block.type, 'value:', JSON.stringify(newVal[block.key]));
        block.value = newVal[block.key];
      }
    });
  }
}, { deep: true })

defineExpose({
  addBlock
})
</script>

<template>
  <div 
    class="blockcraft" 
    :class="{ 'blockcraft-dark': localIsDark }"
    :style="{ '--btn-color': mergedTheme.buttonColor, '--btn-text-color': mergedTheme.buttonTextColor }"
  >
    <div 
      v-if="dragIndex !== -1" 
      class="trash-bin-fixed"
      :class="{ 'trash-active': trashIndex !== -1 }"
      @dragover="handleDragOverTrash"
      @drop="handleDropTrash"
      @dragleave="handleDragLeaveTrash"
    >
      🗑️
    </div>
    <div class="blockcraft-toolbar">
      <div class="toolbar-left">
        <h3 class="blockcraft-title">积木编辑器</h3>
      </div>
      <div class="toolbar-right">
        <button 
          class="blockcraft-btn theme-btn"
          :style="{ background: localIsDark ? '#555' : '#ddd', color: localIsDark ? '#fff' : '#333' }"
          @click="toggleTheme"
        >
          {{ localIsDark ? '☀️' : '🌙' }}
        </button>
        <button 
          v-if="mergedAuthority.showImport" 
          class="blockcraft-btn"
          @click="handleImport"
        >
          导入
        </button>
        <button 
          v-if="mergedAuthority.showExport" 
          class="blockcraft-btn"
          @click="handleExport"
        >
          导出
        </button>
        <button 
          v-if="mergedAuthority.showPreview" 
          class="blockcraft-btn"
          @click="handlePreview"
        >
          预览
        </button>
      </div>
    </div>
    
    <input 
      ref="fileInput" 
      type="file" 
      accept=".json" 
      style="display: none" 
      @change="handleFileChange"
    />
    
    <div 
      class="blockcraft-canvas"
      :style="{ background: mergedTheme.canvasBg }"
    >
      <div 
        v-for="(block, index) in fieldBlocks" 
        :key="block.id"
        class="block-item-wrapper"
        :class="{ 
          'drag-over': dragOverIndex === index,
          'dragging': dragIndex === index
        }"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover.prevent="handleDragOver(index)"
        @drop="handleDrop(index)"
        @dragend="handleDragEnd"
      >
        <BlockItem
          :block="block"
          :theme="mergedTheme"
          :is-dark="localIsDark"
          :sub-block="block.subBlock || props.block.subBlock || []"
          :show-remove="false"
          @update="(value) => updateBlockValue(block.id, value)"
        />
      </div>
      
      <div v-if="fieldBlocks.length === 0" class="empty-canvas">
        点击上方积木添加字段
      </div>
    </div>

    <div v-if="previewVisible" class="preview-modal-overlay" @click="previewVisible = false">
      <div class="preview-modal" @click.stop>
        <div class="preview-header">
          <h3>JSON 预览</h3>
          <button class="close-btn" @click="previewVisible = false">&times;</button>
        </div>
        <pre class="preview-content">{{ JSON.stringify(getJsonData(), null, 2) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.blockcraft {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
}

.blockcraft-dark {
  background: #2d2d2d;
  color: #fff;
}

.blockcraft-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.blockcraft-dark .blockcraft-toolbar {
  background: #3d3d3d;
  border-color: #4d4d4d;
}

.blockcraft-dark .blockcraft-btn {
  --btn-color: #2d5a8a;
  --btn-text-color: #ffffff;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.blockcraft-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  gap: 8px;
}

.blockcraft-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: opacity 0.2s;
  background-color: var(--btn-color, #1890ff);
  color: var(--btn-text-color, #ffffff);
}

.blockcraft-btn:hover {
  opacity: 0.85;
}

.blockcraft-canvas {
  min-height: 200px;
  padding: 16px;
}

.block-item-wrapper {
  margin-bottom: 12px;
  cursor: grab;
  transition: transform 0.2s, opacity 0.2s;
}

.block-item-wrapper.dragging {
  opacity: 0.5;
}

.block-item-wrapper.drag-over {
  transform: translateY(4px);
}

.empty-canvas {
  text-align: center;
  padding: 40px;
  color: #999;
}

.trash-bin-fixed {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #ff6b81;
  cursor: pointer;
  font-size: 36px;
  box-shadow: 0 4px 20px rgba(255, 107, 129, 0.5);
  transition: all 0.2s;
}

.trash-active {
  background: #ff4757;
  box-shadow: 0 6px 20px rgba(255, 71, 87, 0.6);
}

.preview-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.preview-modal {
  background: #fff;
  border-radius: 8px;
  width: 80%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
}

.blockcraft-dark .preview-modal {
  background: #3d3d3d;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.preview-header h3 {
  margin: 0;
  font-size: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.preview-content {
  padding: 16px;
  margin: 0;
  max-height: 60vh;
  overflow: auto;
  background: #f5f5f5;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 13px;
}

.blockcraft-dark .preview-content {
  background: #2d2d2d;
}
</style>