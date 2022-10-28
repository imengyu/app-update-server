<template>
  <div v-if="itemT" class="rule-row">

    <a-checkbox v-model:checked="itemT.enabled" style="width: 30px" />
    <a-button @click="$emit('delete')"><template #icon><CloseOutlined /></template></a-button>
    <a-select v-model:value="itemT.param" placeholder="判断变量" style="width: 200px">
      <a-select-option value="version_code">版本数字</a-select-option>
      <a-select-option value="version_name">版本名称</a-select-option>
      <a-select-option value="last_update_time">客户端上次更新时间</a-select-option>
      <a-select-option value="has_param">客户端携带指定参数</a-select-option>
    </a-select>
    <a-select v-model:value="itemT.operator" placeholder="条件" style="width: 110px">
      <a-select-option value="greaterThan">大于</a-select-option>
      <a-select-option value="greaterThanOrEqual">大于等于</a-select-option>
      <a-select-option value="equal">等于</a-select-option>
      <a-select-option value="lessThan">小于</a-select-option>
      <a-select-option value="lessThanOrEqual">小于等于</a-select-option>
      <a-select-option value="regrex">匹配正则</a-select-option>
    </a-select>

    <a-tooltip>
      <template #title>
        <div>
          <b>自定义参数说明</b><br/>
          <span>自定义参数许您从客户端发出指定标志，您可以在此次更新设置您需要的更新条件，只有满足条件的才更新，下面是一些说明：</span>
          <ul>
            <li>大于、大于等于、小于、小于等于判断标志将会把输入参数转为数字进行比较</li>
            <li>等于判断标志可以比较字符串、数字、日期</li>
            <li>匹配正则将会把输入参数转为字符串进行比较</li>
            <li>参数名称为“_time”结尾时，将会把输入参数转为日期进行比较</li>
          </ul>
        </div>
      </template>
      <QuestionCircleOutlined style="width: 20px" />
    </a-tooltip>
    <a-checkbox v-if="item.param=='has_param'" v-model:checked="customInputParam" style="width: 20px" title="手动输入"></a-checkbox>
    <a-select v-if="item.param=='has_param' && !customInputParam" v-model:value="itemT.paramName" placeholder="参数名称" style="width: 200px">
      <a-select-option value="app_version_code">原生包版本数字 (app_version_code)</a-select-option>
      <a-select-option value="app_version_name">原生包版本名称 (app_version_name)</a-select-option>
      <a-select-option value="hot_update">热更新标志 (hot_update)</a-select-option>
      <a-select-option value="last_update_time">上次更新时间 (last_update_time)</a-select-option>
      <a-select-option value="indev">内测版 (indev)</a-select-option>
    </a-select>
    <a-input v-if="item.param=='has_param' && customInputParam" v-model:value="itemT.paramName" placeholder="手动输入参数名称" style="flex:1;" />

    <a-input v-if="item.param=='version_name'||item.param=='has_param'" v-model:value="itemT.value" placeholder="值" style="flex:1;" />
    <a-input-number v-else-if="item.param=='version_code'" v-model:value="itemT.value" placeholder="值" :min="0" style="flex:1;" />
    <DateStringPicker v-else-if="item.param=='last_update_time'" v-model:value="itemT.value" placeholder="值" style="flex:1;" />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { CloseOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import DateStringPicker from './DateStringPicker.vue'

export default defineComponent({
  components: {
    DateStringPicker,
    QuestionCircleOutlined,
    CloseOutlined,
  },
  props: {
    item: {
      type: Object,
    },
  },
  watch: {
    item() { this.itemT = this.item; },
  },
  emits: [ 'delete' ],
  data() {
    return {
      itemT: null,
      customInputParam: false,
    };
  },
  mounted() {
    this.itemT = this.item;
  },
});
</script>

<style lang="scss">
.rule-row {
  display: flex;
  flex-direction: row;
  align-items: center;  
  position: relative;
  padding: 10px;
  border: 1px solid #b1b1b1;
  background-color: #e2e2e2;
  border-radius: 8px;
}
</style>