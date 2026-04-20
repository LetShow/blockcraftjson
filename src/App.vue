<script setup>
import { ref, watch, nextTick } from "vue";
import BlockCraft from "./components/BlockCraft.vue";

const blockConfig = ref({
  block: [
    { key: "name", name: "姓名", type: "string", unique: true },
    { key: "class", name: "班级", type: "string" },
    { key: "age", name: "年龄", type: "number", unique: true },
    { key: "sex", name: "性别", type: "select", options: ["男", "女"], unique: true },
    { key: "birthday", name: "生日", type: "date" },
    { key: "address", name: "地址", type: "textarea", options: { rows: 3 } },
    {
      key: "hobby",
      name: "爱好",
      type: "checkbox",
      options: ["吃饭", "睡觉", "打豆豆"],
    },
    {
      key: "isStudent",
      name: "是否学生",
      type: "radio",
      options: ["是", "否"],
    },
    {
      key: "family",
      name: "家庭成员",
      type: "array",
      options: ["s_name", "s_relation"],
    },
    {
      key: "custom",
      name: "自定义数据",
      type: "keyvalue",
    },
  ],
  subBlock: [
    { key: "s_name", name: "姓名", type: "string" },
    {
      key: "s_relation",
      name: "关系",
      type: "select",
      options: ["父子", "母子", "兄弟", "姐妹"],
    },
  ],
});

const themeConfig = ref({
  blockColor: "#4a90d9",
  blockTextColor: "#ffffff",
  canvasBg: "#f5f5f5",
  buttonColor: "#4a90d9",
  buttonTextColor: "#ffffff",
  isDark: false,
});

const authorityConfig = ref({
  showImport: true,
  showExport: true,
  showPreview: true,
  showConfig: false,
});

const formData = ref({});
const handleChange = (data) => {
  console.log("数据变化:", data);
};

const showConfig = ref(false);
const editMode = ref(false);
const editText = ref("");

const applyEdit = (text) => {
  try {
    const data = JSON.parse(text);
    if (data.block) blockConfig.value.block = data.block;
    if (data.subBlock) blockConfig.value.subBlock = data.subBlock;
    if (data.theme) Object.assign(themeConfig.value, data.theme);
    if (data.authority) Object.assign(authorityConfig.value, data.authority);
  } catch (err) {
    console.error("解析失败:", err);
  }
};

const toggleEdit = () => {
  if (editMode.value) {
    applyEdit(editText.value);
  } else {
    editText.value = JSON.stringify(blockConfig.value, null, 2);
  }
  editMode.value = !editMode.value;
};

const blockCraftRef = ref(null);

const handleAddBlock = (block) => {
  blockCraftRef.value?.addBlock(block);
};

const handleThemeChange = (isDark) => {
  themeConfig.value.isDark = isDark;
};

const importData = ref(null);
let importTimer = null;

const handleImportConfig = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          importData.value = data;
          
          const isConfig = Boolean(Array.isArray(data.block) && data.block[0]?.key && data.block[0]?.type);
          console.log('[App] isConfig:', isConfig, 'block:', data.block);
          
          if (isConfig) {
            blockConfig.value.block = data.block;
            console.log('[App] 更新blockConfig');
          }
          if (data.subBlock) blockConfig.value.subBlock = data.subBlock;
          if (data.theme) Object.assign(themeConfig.value, data.theme);
          if (data.authority) Object.assign(authorityConfig.value, data.authority);
          
          importTimer = setTimeout(() => {
            console.log('[App] setTimeout, data keys:', Object.keys(data));
            console.log('[App] setTimeout, blockConfig keys:', blockConfig.value.block.map(b => b.key));
            const importedData = {};
            blockConfig.value.block.forEach(b => {
              if (data.hasOwnProperty(b.key)) {
                const val = data[b.key];
                console.log('[App] 处理block:', b.key, 'type:', b.type, 'val:', JSON.stringify(val));
                if (b.type === 'keyvalue' && typeof val === 'object' && val !== null) {
                  const kv = Object.entries(val).map(([key, value]) => ({ key, value }));
                  console.log('[App] keyvalue转换:', b.key, '=>', kv);
                  importedData[b.key] = kv;
                } else if (b.type === 'array') {
                  importedData[b.key] = val || [];
                } else if (b.type === 'string' || b.type === 'number') {
                  importedData[b.key] = val;
                } else {
                  importedData[b.key] = val;
                }
              }
            });
            console.log('[App] formData设置:', JSON.stringify(importedData));
            formData.value = importedData;
            importData.value = null;
          }, 200);
        } catch (err) {
          console.error("导入失败:", err);
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
};

const handleExportConfig = () => {
  const data = {
    block: blockConfig.value.block,
    subBlock: blockConfig.value.subBlock,
    theme: themeConfig.value,
    authority: authorityConfig.value,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "blockcraft-config.json";
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="demo-container">
    <h1>BlockCraft JSON 编辑器</h1>
    <p class="description">一个通过积木块拖拽方式编辑 JSON 数据的 Vue3 组件</p>

    <div class="config-section">
      <div class="section-header" @click="showConfig = !showConfig">
        <h2>配置</h2>
        <div class="header-actions">
          <button class="action-btn" @click.stop="handleImportConfig">打开</button>
          <button class="action-btn" @click.stop="handleExportConfig">保存</button>
          <span class="toggle-icon">{{ showConfig ? "▶" : "▼" }}</span>
        </div>
      </div>
      <div v-show="showConfig" class="section-content">
        <div class="edit-toolbar">
          <button class="edit-btn" @click="toggleEdit">
            {{ editMode ? "保存" : "编辑" }}
          </button>
        </div>
        <textarea
          v-if="editMode"
          v-model="editText"
          class="config-textarea"
        ></textarea>
        <pre v-else class="config-code">{{
          JSON.stringify(blockConfig, null, 2)
        }}</pre>
      </div>
    </div>

    <div class="main-section">
      <div class="blocks-sidebar" :class="{ 'sidebar-dark': themeConfig.isDark }">
        <h3>可选积木</h3>
        <div class="available-blocks">
          <button
            v-for="b in blockConfig.block"
            :key="b.key"
            class="block-btn"
            :style="{
              background: themeConfig.blockColor,
              color: themeConfig.blockTextColor,
            }"
            @click="handleAddBlock(b)"
          >
            {{ b.name }}
          </button>
        </div>
      </div>
      <div class="component-wrapper">
        <div class="component-section">
          <h2>组件演示</h2>
          <BlockCraft
            ref="blockCraftRef"
            :block="blockConfig"
            :theme="themeConfig"
            :authority="authorityConfig"
            v-model="formData"
            @change="handleChange"
            @themeChange="handleThemeChange"
          />
        </div>
      </div>
    </div>

    <div class="result-section">
      <h2>当前数据</h2>
      <pre class="result-code">{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f0f2f5;
  min-height: 100vh;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 8px;
}

.description {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
}

h2,
h3 {
  color: #333;
  margin: 0;
}

.config-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  background: #4a90d9;
  color: #fff;
  transition: opacity 0.2s;
}

.action-btn:hover {
  opacity: 0.85;
}

.section-header:hover {
  background: #fafafa;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 600;
}

.toggle-icon {
  color: #666;
  font-size: 12px;
}

.section-content {
  padding: 16px 20px;
}

.config-code {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  font-family: "Monaco", "Menlo", monospace;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
}

.edit-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.edit-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  background: #e0e0e0;
  color: #333;
  transition: opacity 0.2s;
}

.edit-btn:hover {
  opacity: 0.85;
}

.config-textarea {
  width: 100%;
  min-height: 300px;
  font-family: "Monaco", "Menlo", monospace;
  font-size: 13px;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  resize: vertical;
  background: #f5f5f5;
}

.main-section {
  display: flex;
  gap: 24px;
  margin-bottom: 24px;
}

.blocks-sidebar {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  align-self: flex-start;
  position: sticky;
  top: 24px;
}

.sidebar-dark {
  background: #2d2d2d !important;
}

.sidebar-dark h3 {
  color: #ccc !important;
  border-color: #444 !important;
}

.sidebar-dark .available-blocks {
  color: #ccc;
}

.blocks-sidebar h3 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.available-blocks {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.block-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  text-align: left;
  transition: opacity 0.2s;
}

.block-btn:hover {
  opacity: 0.85;
}

.component-wrapper {
  flex: 1;
  min-width: 0;
}

.component-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.component-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.result-section {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 20px;
}

.result-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e0e0e0;
}

.result-code {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 13px;
  font-family: "Monaco", "Menlo", monospace;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
}
</style>
