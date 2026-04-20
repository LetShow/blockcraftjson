<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  block: {
    type: Object,
    required: true,
  },
  theme: {
    type: Object,
    default: () => ({}),
  },
  isDark: {
    type: Boolean,
    default: false,
  },
  subBlock: {
    type: Array,
    default: () => [],
  },
  showRemove: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update", "remove"]);

const localValue = ref(props.block.value);

watch(
  () => props.block.value,
  (newVal) => {
    localValue.value = newVal;
  },
);

const handleInput = (value) => {
  localValue.value = value;
  emit("update", value);
};

const arrayItems = ref(props.block.value || []);

const addArrayItem = () => {
  const newItem = {};
  props.subBlock.forEach((field) => {
    newItem[field.key] = "";
  });
  arrayItems.value.push(newItem);
  emit("update", arrayItems.value);
};

const removeArrayItem = (index) => {
  arrayItems.value.splice(index, 1);
  emit("update", arrayItems.value);
};

const updateArrayItem = (index, key, value) => {
  arrayItems.value[index][key] = value;
  emit("update", arrayItems.value);
};

const arrayValue = computed({
  get: () => arrayItems.value,
  set: (val) => {
    arrayItems.value = val;
    emit("update", val);
  },
});

const keyValueItems = ref([]);

watch(
  () => props.block?.value,
  (newVal) => {
    if (Array.isArray(newVal)) {
      keyValueItems.value = JSON.parse(JSON.stringify(newVal));
    } else if (newVal && typeof newVal === 'object') {
      keyValueItems.value = Object.entries(newVal).map(([key, value]) => ({ key, value: String(value) }));
    } else {
      keyValueItems.value = [];
    }
  },
  { immediate: true, deep: true },
);

const addKeyValueItem = () => {
  keyValueItems.value.push({ key: "", value: "" });
  emit("update", keyValueItems.value);
};

const removeKeyValueItem = (index) => {
  keyValueItems.value.splice(index, 1);
  emit("update", keyValueItems.value);
};

const updateKeyValueItem = (index, field, value) => {
  keyValueItems.value[index][field] = value;
  emit("update", keyValueItems.value);
};

const handleCheckboxChange = (option) => {
  const current = localValue.value || [];
  const index = current.indexOf(option);
  if (index > -1) {
    current.splice(index, 1);
  } else {
    current.push(option);
  }
  emit("update", [...current]);
};
</script>

<template>
  <div
    class="block-item"
    :class="{ 'block-item-dark': isDark }"
    :style="{
      borderLeftColor: theme.blockColor,
      background: isDark ? '#2d2d2d' : '#fff',
    }"
  >
    <div class="block-row">
      <div class="block-label">
        <span
          class="block-name"
          :style="{ background: theme.blockColor, color: theme.blockTextColor }"
        >
          {{ block.name }}
        </span>
      </div>
      <div class="block-content">
        <!-- string 类型 -->
        <input
          v-if="block.type === 'string'"
          type="text"
          class="block-input"
          :class="{ 'input-dark': isDark }"
          :value="localValue"
          @input="handleInput($event.target.value)"
          placeholder="请输入"
        />

        <!-- number 类型 -->
        <input
          v-else-if="block.type === 'number'"
          type="number"
          class="block-input"
          :class="{ 'input-dark': isDark }"
          :value="localValue"
          @input="handleInput(Number($event.target.value))"
          placeholder="请输入数字"
        />

        <!-- select 类型 -->
        <select
          v-else-if="block.type === 'select'"
          class="block-select"
          :class="{ 'input-dark': isDark }"
          :value="localValue"
          @change="handleInput($event.target.value)"
        >
          <option value="">请选择</option>
          <option v-for="opt in block.options" :key="opt" :value="opt">
            {{ opt }}
          </option>
        </select>

        <!-- date 类型 -->
        <input
          v-else-if="block.type === 'date'"
          type="date"
          class="block-input"
          :class="{ 'input-dark': isDark }"
          :value="localValue"
          @input="handleInput($event.target.value)"
        />

        <!-- textarea 类型 -->
        <textarea
          v-else-if="block.type === 'textarea'"
          class="block-textarea"
          :class="{ 'input-dark': isDark }"
          :rows="block.options?.rows || 3"
          :value="localValue"
          @input="handleInput($event.target.value)"
          placeholder="请输入"
        />

        <!-- checkbox 类型 -->
        <div v-else-if="block.type === 'checkbox'" class="block-checkbox-group">
          <label v-for="opt in block.options" :key="opt" class="checkbox-label">
            <input
              type="checkbox"
              :checked="(localValue || []).includes(opt)"
              @change="handleCheckboxChange(opt)"
            />
            {{ opt }}
          </label>
        </div>

        <!-- radio 类型 -->
        <div v-else-if="block.type === 'radio'" class="block-radio-group">
          <label v-for="opt in block.options" :key="opt" class="radio-label">
            <input
              type="radio"
              :name="block.key"
              :value="opt"
              :checked="localValue === opt"
              @change="handleInput(opt)"
            />
            {{ opt }}
          </label>
        </div>

        <!-- keyvalue 类型 -->
        <div v-else-if="block.type === 'keyvalue'" class="block-keyvalue">
          <div
            v-for="(item, index) in keyValueItems"
            :key="index"
            class="keyvalue-item"
          >
            <input
              type="text"
              class="block-input kv-key"
              :class="{ 'input-dark': isDark }"
              :value="item.key"
              @input="updateKeyValueItem(index, 'key', $event.target.value)"
              placeholder="键"
            />
            <span class="kv-separator">:</span>
            <input
              type="text"
              class="block-input kv-value"
              :class="{ 'input-dark': isDark }"
              :value="item.value"
              @input="updateKeyValueItem(index, 'value', $event.target.value)"
              placeholder="值"
            />
            <button class="kv-remove-btn" @click="removeKeyValueItem(index)">
              删除
            </button>
          </div>
          <button class="kv-add-btn" @click="addKeyValueItem">+ 添加</button>
        </div>

        <!-- array 类型 -->
        <div v-else-if="block.type === 'array'" class="block-array">
          <div
            v-for="(item, index) in arrayItems"
            :key="index"
            class="array-item"
          >
            <div class="array-item-header">
              <span>第 {{ index + 1 }} 项</span>
              <button class="array-remove-btn" @click="removeArrayItem(index)">
                删除
              </button>
            </div>
            <div class="array-item-content">
              <div
                v-for="field in subBlock"
                :key="field.key"
                class="array-field"
              >
                <label class="array-field-label">{{ field.name }}</label>

                <input
                  v-if="field.type === 'string'"
                  type="text"
                  class="block-input"
                  :class="{ 'input-dark': isDark }"
                  :value="item[field.key]"
                  @input="
                    updateArrayItem(index, field.key, $event.target.value)
                  "
                />

                <select
                  v-else-if="field.type === 'select'"
                  class="block-select"
                  :class="{ 'input-dark': isDark }"
                  :value="item[field.key]"
                  @change="
                    updateArrayItem(index, field.key, $event.target.value)
                  "
                >
                  <option value="">请选择</option>
                  <option v-for="opt in field.options" :key="opt" :value="opt">
                    {{ opt }}
                  </option>
                </select>
              </div>
            </div>
          </div>

          <button class="array-add-btn" @click="addArrayItem">+ 添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.block-item {
  border-left: 4px solid #4a90d9;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  padding: 8px;
  gap: 8px;
  background: #fff;
}

.block-item-dark {
  background: #2d2d2d !important;
}

.block-item-dark .block-label {
  color: #ccc;
}

.block-item-dark .block-name {
  background: #3d5a80 !important;
  color: #fff !important;
}

.input-dark {
  background: #3d3d3d !important;
  border-color: #555 !important;
  color: #fff !important;
}

.input-dark::placeholder {
  color: #888 !important;
}

.block-item-dark .checkbox-label,
.block-item-dark .radio-label {
  color: #ccc;
}

.block-item-dark .array-item {
  border-color: #444;
  background: #262626;
}

.block-item-dark .array-item-header {
  background: #333;
  color: #ccc;
}

.block-item-dark .array-item-content {
  background: #2a2a2a;
}

.block-item-dark .array-field-label {
  color: #aaa;
}

.block-row {
  display: flex;
  flex: 1;
  align-items: flex-start;
  gap: 12px;
}

.block-label {
  flex-shrink: 0;
  width: 80px;
  padding-top: 6px;
}

.block-name {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.block-content {
  flex: 1;
  min-width: 0;
}

.block-input,
.block-select,
.block-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.block-input:focus,
.block-select:focus,
.block-textarea:focus {
  outline: none;
  border-color: #4a90d9;
}

.block-textarea {
  resize: vertical;
  min-height: 60px;
}

.block-checkbox-group,
.block-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.block-array {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.array-item {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.array-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f9f9f9;
  font-size: 13px;
  font-weight: 500;
}

.array-remove-btn {
  background: none;
  border: none;
  color: #f00;
  cursor: pointer;
  font-size: 12px;
}

.array-item-content {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.array-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.array-field-label {
  font-size: 12px;
  color: #666;
}

.keyvalue-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.kv-key {
  width: 120px;
}

.kv-separator {
  color: #666;
}

.kv-value {
  flex: 1;
}

.kv-remove-btn {
  padding: 4px 8px;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.kv-remove-btn:hover {
  background: #c0392b;
}

.kv-add-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.kv-add-btn:hover {
  background: #3a7bc8;
}

.array-add-btn {
  align-self: flex-start;
  padding: 8px 16px;
  background: #4a90d9;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

.array-add-btn:hover {
  background: #3a7bc8;
}
</style>
