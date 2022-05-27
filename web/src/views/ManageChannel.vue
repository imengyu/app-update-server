<template>
  <div class="p-4">
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <a-button class="float-left" type="primary" @click="handleNew">
        <template #icon><PlusOutlined /></template>
        新建渠道
      </a-button>
      <a-form-item label="搜索渠道名字" name="name">
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
          <a @click="handleDelete(record)">删除</a>
        </span>
      </template>
    </a-table>
    <div v-else-if="dataLoadStatus=='failed'" class="error">
      <icon-font style="color: rgb(114, 36, 39);font-size:3em" type="icon-error-"/>
      <h1>数据加载失败</h1>
      <a-button type="link" @click="loadTableData">重试</a-button>
    </div>
    <!--编辑对话框-->
    <a-modal v-model:visible="visibleEditDialog" :title="(isNew?'添加':'编辑')+'渠道'" @ok="handleEditOk" :width="850">
      <a-form ref="formEdit" :model="formEditState" :rules="formEditRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名字" name="name">
          <a-input v-model:value="formEditState.name" />
        </a-form-item>
        <a-form-item label="标识符" name="code">
          <a-input v-model:value="formEditState.code" />
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
import { IChannelInfo } from '@/api/channel';

export default defineComponent({
  components: {
    PlusOutlined,
  },
  name: 'ManageChannel',
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
        title: '渠道名称',
        sorter: true,
      },
      {
        dataIndex: 'code',
        key: 'code',
        title: '标识符',
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
    const dataSource = ref(new Array<IChannelInfo>());
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
    const formEditState = reactive<IChannelInfo>({
      id: 0,
      name: '',
      code: '',
      status: 'enabled',
    } as IChannelInfo);
    const formEditRules = {
      name: [
        { required: true, message: '请输入名字', trigger: 'blur' },
        { max: 30, message: '名称必须小于30个字符', trigger: 'blur' },
      ],
      code: [
        { required: true, message: '请输入包名', trigger: 'blur' },
        { max: 30, message: '包名名称必须小于30个字符', trigger: 'blur' },
      ],
    };

    const loadTableData = (page?: number) => {
      if(typeof page === 'number') dataPagination.current = page;
      dataLoadStatus.value = 'loading';
      api.channel.getPage(dataPagination.current, dataPagination.pageSize, {
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
          api.channel.add(formEditState).then((data) => {
            message.success('新建渠道成功');
            if(data.data) {
              visibleEditDialog.value = false;
              loadTableData();
            }
          }).catch((e) => {
            message.error('新建渠道失败：' + e);
          });
        } else {
          api.channel.update(formEditState.id, formEditState).then(() => {
            message.success('更新渠道成功');
            visibleEditDialog.value = false;
            loadTableData();
          }).catch((e) => {
            message.error('更新渠道失败：' + e);
          });
        }
      })
      .catch(() => { /* */ });
    };
    const handleEdit = (record: IChannelInfo) => {
      visibleEditDialog.value = true;
      isNew.value = false;
      common.cloneValue(formEditState, record);
    };
    const handleDelete = (record: IChannelInfo) => {
      Modal.confirm({
        title: '确认删除渠道?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '删除渠道将导致其下所有更新信息丢失，已存在的线下App将无法连接更新，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.channel.delete(record.id).then(() => {
              message.success('删除渠道成功');
              loadTableData();
              resolve();
            }).catch((e) => {
              message.error('删除渠道失败' + e)
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
      formEditState.code = '';
      formEditState.status = 'enabled';
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

      labelCol: { span: 6 },
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

      filterSelectOption(input: string, option: { name: string })  {
        return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      keyExctrator(row: IChannelInfo) { return row.id },
    }
  },
})
</script>

