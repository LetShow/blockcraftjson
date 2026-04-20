import BlockCraft from './components/BlockCraft.vue'
import BlockItem from './components/BlockItem.vue'

export { BlockCraft, BlockItem }

export default {
  install(app) {
    app.component('BlockCraft', BlockCraft)
    app.component('BlockItem', BlockItem)
  }
}