<template>
  <div class="p-4">
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <a-form-item label="搜索安装包名字" name="name">
        <a-input v-model:value="formSearchState.name" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button class="ml-3" @click="handleSearchReset">清空</a-button>
      </a-form-item>
    </a-form>
    <!--表格-->
    <a-table 
      :columns="columns"
      :row-key="keyExctrator"
      :pagination="dataPagination"
      :data-source="dataSource"
      :loading="dataLoadStatus=='loading'"
      v-if="dataLoadStatus=='success'||dataLoadStatus=='loading'"
      @change="handleTableChange">
      <template #urls="{ record }">
        <span>下载地址：<a :href="record.abs_path" target="_blank">{{record.abs_path}}</a></span><br/>
        <span v-if="record.local_path">本地存储地址：{{record.local_path}}</span><br/>
        <span v-if="record.third_storage_path">第三方存储地址：{{record.third_storage_path}}</span><br/>
      </template>
      <template #upload_user_id="{ record }">
        <span>{{record.upload_user_name || '暂无'}}({{record.upload_user_id}})</span>
      </template>
      <template #delete_user_id="{ record }">
        <span>{{record.delete_user_name || '暂无'}}({{record.delete_user_id}})</span>
      </template>
      <template #using_status="{ record }">
        <span v-if="record.using_status > 0">
          <span>当前安装包被使用</span><br/>
          <span>应用：{{record.name}}</span><br/>
          <span>版本：{{record.version_name}}({{record.version_code}})</span>
        </span>
        <span v-else>
          <span>当前安装包未使用</span>
        </span>
      </template>
      <template #action="{ record }">
        <span v-if="record.using_status == 0">
          <a class="text-danger" @click="handleDelete(record)">删除</a>
        </span>
      </template>
    </a-table>
    <div v-else-if="dataLoadStatus=='failed'" class="error">
      <icon-font style="color: rgb(114, 36, 39);font-size:3em" type="icon-error-"/>
      <h1>数据加载失败</h1>
      <a-button type="link" @click="loadTableData">重试</a-button>
    </div>
  </div>
</template>

<script lang="ts">
import api, { LoadStatus } from '@/api';
import common from '@/utils/common';
import { message, Modal } from 'ant-design-vue';
import { createVNode, defineComponent, onMounted, reactive, ref } from 'vue'
import { Pagination, TableStateFilters } from '../models/TableCommon'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { IStorageInfo } from '@/api/storage';

export default defineComponent({
  components: {
  },
  name: 'ManageStorage',
  setup: () => {

    const columns = [
      {
        dataIndex: 'id',
        key: 'id',
        title: 'ID',
      },
      {
        dataIndex: 'date',
        key: 'date',
        title: '上传时间',
        sorter: true,
      },
      {
        slots: { customRender: 'urls' },
        key: 'abs_path',
        title: '地址',
      },
      {
        slots: { customRender: 'upload_user_id' },
        key: 'upload_user_id',
        title: '上传者',
      },
      {
        slots: { customRender: 'delete_user_id' },
        key: 'delete_user_id',
        title: '删除者',
      },
      {
        slots: { customRender: 'using_status' },
        key: 'using_status',
        title: '使用状态',
      },
      {
        title: '操作',
        key: 'action',
        slots: { customRender: 'action' },
      },
    ];

    const dataSource = ref(new Array<IStorageInfo>());
    const dataPagination = reactive({
      total: 0,
      current: 1,
      pageSize: 10,
    });
    const dataSort = reactive({
      field: "",
      order: "",
    });
    const dataFilter = ref({});
    const dataLoadStatus = ref<LoadStatus>('notload');
    const dataLoadError = ref('');
    const visibleEditDialog = ref(false);
    const isNew = ref(false);

    const formSearch = ref();
    const formSearchState = reactive({
      name: '',
    });    

    const loadTableData = (page?: number) => {
      if(typeof page === 'number') dataPagination.current = page;
      dataLoadStatus.value = 'loading';
      api.storage.getPage(dataPagination.current, dataPagination.pageSize, {
        search: {
          name: common.stringToSearchValue(formSearchState.name, true),
        },
        sort: {
          field: common.emptyToUndefined(dataSort.field),
          order: common.emptyToUndefined(dataSort.order),
        },
        filter: dataFilter.value,
      }).then((data) => {
        dataLoadStatus.value = 'success';
        if(data.data) {
          dataPagination.total = data.data.allCount;
          dataSource.value = data.data.items;
        }
      }).catch((e) => {
        dataLoadStatus.value = 'failed';
        dataLoadError.value = e;
      })
    };
    const handleSearch = () => { 
      loadTableData(1); 
    };
    const handleSearchReset = () => {
      if(formSearch.value != null)
        (formSearch.value).resetFields();
      loadTableData(1);
    };
    const handleTableChange = (pag: Pagination, filters: TableStateFilters, sorter: { field: string; order: string }) => {
      dataSort.field = sorter.field;
      dataSort.order = sorter.order;
      dataFilter.value = filters;
      loadTableData(pag?.current);
    };
    const handleDelete = (record: IStorageInfo) => {
      Modal.confirm({
        title: '确认删除安装包?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '删除安装包后无法恢复，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.storage.delete(record.id).then(() => {
              message.success('删除安装包成功');
              loadTableData();
              resolve();
            }).catch((e) => {
              message.error('删除安装包失败' + e)
              reject();
            })
          }).catch((e) => console.log(e));
        },
      });
    };

    onMounted(() => {
      loadTableData(1);
    });

    return {

      columns,
      dataSource,
      dataPagination,
      dataSort,
      dataFilter,
      dataLoadStatus,
      dataLoadError,
      formSearchState,

      isNew,

      labelCol: { span: 6 },
      wrapperCol: { span: 14 },

      visibleEditDialog,

      loadTableData,

      handleSearch,
      handleSearchReset,
      handleTableChange,
      handleDelete,

      filterSelectOption(input: string, option: { name: string })  {
        return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      keyExctrator(row: IStorageInfo) { return row.id },
    }
  },
})
</script>

