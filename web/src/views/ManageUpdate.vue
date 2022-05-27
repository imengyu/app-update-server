<template>
  <div class="p-4">
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <div class="float-left d-flex flex-row text-left">
        <a-button type="primary" @click="handleNew">
          <template #icon><PlusOutlined /></template>
          发布更新
        </a-button>
        <a-select class="ml-3" style="width:200px;text-align:left;" v-model:value="formSearchState.app_id" show-search placeholder="选择对应应用"  :filter-option="filterSelectOption" option-filter-prop="label" @change="handleSearch">
          <a-select-option v-for="(n, i) in appNames" :key="i" :value="n.id" :name="n.name">{{ n.name }}</a-select-option>
        </a-select>
      </div>
      <a-form-item label="搜索发布版本" name="version_name">
        <a-input v-model:value="formSearchState.version_name" />
      </a-form-item>
      <a-form-item label="搜索版本号" name="version_code">
        <a-input v-model:value="formSearchState.version_code" />
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
      v-if="formSearchState.app_id && dataLoadStatus=='success'||dataLoadStatus=='loading'"
      @change="handleTableChange">
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
    <a-modal v-model:visible="visibleEditDialog" :title="(isNew?'添加':'编辑')+'更新'" @ok="handleEditOk" width="80%">
      <a-form ref="formEdit" :model="formEditState" :rules="formEditRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="版本名字（给用户看的，例如1.0.0）" name="version_name">
          <a-input v-model:value="formEditState.version_name" />
        </a-form-item>
        <a-form-item label="版本号（用于程序判断，是数字）" type="number" name="version_code">
          <a-input v-model:value="formEditState.version_code" />
        </a-form-item>
        <a-form-item label="更新内容文案" name="post_note">
          <a-textarea v-model:value="formEditState.version_code" showCount :maxlength="255"></a-textarea>
        </a-form-item>
        <a-form-item label="推送渠道" name="post_channels">

        </a-form-item>
        <a-form-item label="推送版本号条件" name="post_version_code_mask">
          <a-input v-model:value="formEditState.post_version_code_mask" />
        </a-form-item>
        <a-form-item label="推送版本号版本号匹配正则" name="post_version_name_mask">
          <a-input v-model:value="formEditState.post_version_name_mask" />
        </a-form-item>
        <a-form-item label="更新安装包下载URL" name="update_package_url">
          <a-input v-model:value="formEditState.update_package_url" />
        </a-form-item>
        <a-form-item v-if="false" label="更新安装包下载URL（热更新）" name="update_hot_update_url">
          <a-input v-model:value="formEditState.update_hot_update_url" />
        </a-form-item>
        <a-form-item label="状态" name="code">
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
import { IUpdateInfo } from '@/api/update';
import { useRoute } from 'vue-router';
import { IAppInfo } from '@/api/app';

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
        dataIndex: 'version_name',
        key: 'version_name',
        title: '更新名称',
        sorter: true,
      },
      {
        dataIndex: 'version_code',
        key: 'version_code',
        title: '版本号',
        sorter: true,
      },
      {
        dataIndex: 'date',
        key: 'date',
        title: '发布时间',
        sorter: true,
      },
      {
        dataIndex: 'status',
        key: 'status',
        title: '更新状态',
      },
      {
        title: '操作',
        key: 'action',
        slots: { customRender: 'action' },
      },
    ];

    const managePermission = ref();
    const dataSource = ref(new Array<IUpdateInfo>());
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

    const appNames = ref<IAppInfo[]>([]); 

    const route = useRoute();

    const formSearch = ref();
    const formSearchState = reactive({
      version_name: '',
      version_code: '',
      app_id: parseInt(route.query.app_id as string) || null as null|number,
    });    
    
    const formEdit = ref();
    const formEditState = reactive<IUpdateInfo>({
      date: new Date().format(),
      status: 'enabled',
      app_id: formSearchState.app_id || 0,
      post_note: '',
      post_channels: '',
      post_version_code_mask: '',
      post_version_name_mask: '',
      version_name: '',
      version_code: '',
      update_package_url: '',
      update_hot_update_url: '',
    } as IUpdateInfo);
    const formEditRules = {
      version_name: [
        { required: true, message: '请输入名字', trigger: 'blur' },
        { max: 30, message: '名称必须小于30个字符', trigger: 'blur' },
      ],
      version_code: [
        { required: true, message: '请输入版本号', trigger: 'blur' },
      ],
      update_package_url: [
        { required: true, message: '请输入更新安装包下载URL', trigger: 'blur' },
      ],
    };

    const loadTableData = (page?: number) => {
      if(typeof page === 'number') dataPagination.current = page;
      dataLoadStatus.value = 'loading';
      api.update.getPage(dataPagination.current, dataPagination.pageSize, {
        search: {
          version_code: common.stringToSearchValue(formSearchState.version_code, true),
          version_name: common.stringToSearchValue(formSearchState.version_name, true),
          app_id: formSearchState.app_id || undefined,
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
    function loadGroupNames() {
      api.app.getList().then((data) => appNames.value = data.data || []).catch((e) => message.warn('获取组数据失败！' + e));
    }

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
          api.update.add(formEditState).then((data) => {
            message.success('新建更新成功');
            if(data.data) {
              visibleEditDialog.value = false;
              loadTableData();
            }
          }).catch((e) => {
            message.error('新建更新失败：' + e);
          });
        } else {
          api.update.update(formEditState.id, formEditState).then(() => {
            message.success('更新更新成功');
            visibleEditDialog.value = false;
            loadTableData();
          }).catch((e) => {
            message.error('更新更新失败：' + e);
          });
        }
      })
      .catch(() => { /* */ });
    };
    const handleEdit = (record: IUpdateInfo) => {
      visibleEditDialog.value = true;
      isNew.value = false;
      common.cloneValue(formEditState, record);
    };
    const handleDelete = (record: IUpdateInfo) => {
      Modal.confirm({
        title: '确认删除更新?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '删除更新后会一并删除文件，无法恢复，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.update.delete(record.id).then(() => {
              message.success('删除更新成功');
              loadTableData();
              resolve();
            }).catch((e) => {
              message.error('删除更新失败' + e)
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
      formEditState.date = new Date().format();
      formEditState.status = 'enabled';
      formEditState.app_id = formSearchState.app_id || 0;
      formEditState.post_note = '';
      formEditState.post_channels = '';
      formEditState.post_version_code_mask = '';
      formEditState.post_version_name_mask = '';
      formEditState.version_name = '';
      formEditState.version_code = '';
      formEditState.update_package_url = '';
      formEditState.update_hot_update_url = '';
    };

    onMounted(() => {
      if (formSearchState.app_id)
        loadTableData(1);
      loadGroupNames();
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
      appNames,

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

      loadGroupNames,
      filterSelectOption(input: string, option: { name: string })  {
        return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      keyExctrator(row: IUpdateInfo) { return row.id },
    }
  },
})
</script>

