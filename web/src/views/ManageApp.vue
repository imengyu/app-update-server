<template>
  <div class="p-4">
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <a-button class="float-left" type="primary" @click="handleNew">
        <template #icon><PlusOutlined /></template>
        新建应用
      </a-button>
      <a-form-item label="搜索应用名字" name="name">
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
      <template #status="{ record }">
        <a-badge v-if="record.status=='enabled'" status="success" text="正常" />
        <a-badge v-else-if="record.status=='disabled'" status="error" text="暂停更新" />
        <a-badge v-else status="warning" text="未知" />
      </template>
      <template #action="{ record }">
        <span>
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleUpdate(record)">发布更新</a>
          <a-divider type="vertical" />
          <a class="text-danger" @click="handleDelete(record)">删除</a>
        </span>
      </template>
    </a-table>
    <div v-else-if="dataLoadStatus=='failed'" class="error">
      <icon-font style="color: rgb(114, 36, 39);font-size:3em" type="icon-error-"/>
      <h1>数据加载失败</h1>
      <a-button type="link" @click="loadTableData">重试</a-button>
    </div>
    <!--编辑对话框-->
    <a-modal v-model:visible="visibleEditDialog" :title="(isNew?'添加':'编辑')+'应用'" @ok="handleEditOk" :width="850">
      <a-form ref="formEdit" :model="formEditState" :rules="formEditRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名字" name="name">
          <a-input v-model:value="formEditState.name" />
        </a-form-item>
        <a-form-item label="应用包名" name="package_name">
          <a-input v-model:value="formEditState.package_name" />
        </a-form-item>
        <a-form-item label="更新状态" name="code">
          <a-select class="ml-3" v-model:value="formEditState.status">
            <a-select-option value="enabled"><a-badge status="success" text="启用更新" /></a-select-option>
            <a-select-option value="disabled"><a-badge status="error" text="暂停更新" /></a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import api, { LoadStatus } from '@/api';
import common from '@/utils/common';
import { message, Modal } from 'ant-design-vue';
import { createVNode, defineComponent, onMounted, reactive, ref } from 'vue'
import { Pagination, TableStateFilters } from '../models/TableCommon'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { IAppInfo } from '@/api/app';
import router from '@/router';

export default defineComponent({
  components: {
    PlusOutlined,
  },
  name: 'ManageApp',
  setup: () => {

    const columns = [
      {
        dataIndex: 'id',
        key: 'id',
        title: 'ID',
      },
      {
        dataIndex: 'name',
        key: 'name',
        title: 'App名字',
        sorter: true,
      },
      {
        dataIndex: 'package_name',
        key: 'package_name',
        title: '包名',
        sorter: true,
      },
      {
        key: 'status',
        title: '更新状态',
        slots: { customRender: 'status' },
      },
      {
        title: '操作',
        key: 'action',
        slots: { customRender: 'action' },
      },
    ];

    const managePermission = ref();
    const dataSource = ref(new Array<IAppInfo>());
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
    
    const formEdit = ref();
    const formEditState = reactive<IAppInfo>({
      id: 0,
      name: '',
      package_name: '',
    } as IAppInfo);
    const formEditRules = {
      name: [
        { required: true, message: '请输入名字', trigger: 'blur' },
        { max: 30, message: '名称必须小于30个字符', trigger: 'blur' },
      ],
      package_name: [
        { required: true, message: '请输入包名', trigger: 'blur' },
        { patten: /([a-zA-Z_][a-zA-Z0-9_]*[.])*([a-zA-Z_][a-zA-Z0-9_]*)$/, message: '包名格式不对', trigger: 'blur' },
        { max: 60, message: '包名名称必须小于60个字符', trigger: 'blur' },
      ],
    };

    const loadTableData = (page?: number) => {
      if(typeof page === 'number') dataPagination.current = page;
      dataLoadStatus.value = 'loading';
      api.app.getPage(dataPagination.current, dataPagination.pageSize, {
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
    const handleEditOk = () => {
      formEdit.value.validate().then(() => {
        if(isNew.value) {
          api.app.add(formEditState).then((data) => {
            message.success('新建应用成功');
            if(data.data) {
              visibleEditDialog.value = false;
              loadTableData();
            }
          }).catch((e) => {
            message.error('新建应用失败：' + e);
          });
        } else {
          api.app.update(formEditState.id, formEditState).then(() => {
            message.success('更新应用成功');
            visibleEditDialog.value = false;
            loadTableData();
          }).catch((e) => {
            message.error('更新应用失败：' + e);
          });
        }
      })
      .catch(() => { /* */ });
    };
    const handleEdit = (record: IAppInfo) => {
      visibleEditDialog.value = true;
      isNew.value = false;
      common.cloneValue(formEditState, record);
    };
    const handleUpdate = (record: IAppInfo) => {
      router.push({ name: 'ManageUpdate', query: { app_id: record.id } })
    };
    const handleDelete = (record: IAppInfo) => {
      Modal.confirm({
        title: '确认删除应用?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '删除应用将导致其下所有更新信息丢失，已存在的线下App将无法连接更新，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.app.delete(record.id).then(() => {
              message.success('删除应用成功');
              loadTableData();
              resolve();
            }).catch((e) => {
              message.error('删除应用失败' + e)
              reject();
            })
          }).catch((e) => console.log(e));
        },
      });
    };
    const handleNew = () => {
      visibleEditDialog.value = true;
      isNew.value = true;
      formEditState.id = 0;
      formEditState.name = '';
      formEditState.package_name = '';
    };

    onMounted(() => {
      loadTableData(1);
    });

    return {
      managePermission,

      columns,
      dataSource,
      dataPagination,
      dataSort,
      dataFilter,
      dataLoadStatus,
      dataLoadError,
      formSearchState,
      formEdit,
      formEditState,
      formEditRules,

      isNew,

      labelCol: { span: 4 },
      wrapperCol: { span: 14 },

      visibleEditDialog,

      loadTableData,

      handleSearch,
      handleSearchReset,
      handleTableChange,
      handleNew,
      handleEdit,
      handleEditOk,
      handleDelete,
      handleUpdate,

      filterSelectOption(input: string, option: { name: string })  {
        return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      keyExctrator(row: IAppInfo) { return row.id },
    }
  },
})
</script>

