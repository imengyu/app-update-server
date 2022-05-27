<template>
  <div>
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <a-button class="float-left" type="primary" @click="handleNew">
        <template #icon><PlusOutlined /></template>
        新建组
      </a-button>
      <a-form-item label="搜索组名字" name="name">
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
      <template #permissions="{ record }">
        {{ getPermisionCount(record.permissions) + ' 个权限' }}
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
    <a-modal v-model:visible="visibleEditDialog" :title="(isNew?'添加':'编辑')+'组'" @ok="handleEditOk" :width="850">
      <a-form ref="formEdit" :model="formEditState" :rules="formEditRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="名字" name="name">
          <a-input v-model:value="formEditState.name" />
        </a-form-item>
        <a-form-item label="权限" name="permissions">
          <ManageUserPermission ref="managePermission" setType="group" />
        </a-form-item>
        <a-form-item label="组中的用户" name="users">
          <UserTransfer v-model:value="dataCurrentGroupIds" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import api, { LoadStatus } from '@/api';
import common from '@/utils/common';
import StringUtils from '@/utils/string';
import ManageUserPermission from './ManageUserPermission.vue'
import UserTransfer from './UserTransfer.vue'
import { message, Modal } from 'ant-design-vue';
import { createVNode, defineComponent, onMounted, reactive, ref } from 'vue'
import { Pagination, TableStateFilters } from '../../models/TableCommon'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { IGroupInfo } from '@/api/group';

export default defineComponent({
  components: {
    ManageUserPermission,
    UserTransfer,
    PlusOutlined,
  },
  name: 'ManageUsers',
  setup: () => {

    const columns = [
      {
        dataIndex: 'name',
        key: 'name',
        title: '组名字',
        sorter: true,
      },
      {
        title: '组权限',
        dataIndex: 'permissions',
        slots: { customRender: 'permissions' },
      },
      {
        title: '组中用户数',
        dataIndex: 'user_count',
      },
      {
        title: '操作',
        key: 'action',
        slots: { customRender: 'action' },
      },
    ];

    const managePermission = ref();

    const dataCurrentGroupIds = ref('');
    const dataSource = ref(new Array<IGroupInfo>());
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
    const formEditState = reactive<IGroupInfo>({
      id: 0,
      name: '',
      accessable_app: '',
      non_accessable_app: '',
      belone_app_id: 0,
      permissions: '',
    } as IGroupInfo);
    const formEditRules = {
      name: [
        { required: true, message: '请输入组名字', trigger: 'blur' },
        { max: 30, message: '组名称必须小于30个字符', trigger: 'blur' },
      ]
    };

    const loadTableData = (page?: number) => {
      if(typeof page === 'number') dataPagination.current = page;
      dataLoadStatus.value = 'loading';
      api.group.getPage(dataPagination.current, dataPagination.pageSize, {
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
      const updateUserGroups = (id: number) => {
        api.user.updateUsersGroup(id, dataCurrentGroupIds.value).then(() => {
          message.success('更新用户组信息成功');
          visibleEditDialog.value = false;
        }).catch((e) => {
          message.error('更新用户组信息失败：' + e);
        });
      };
      formEdit.value.validate().then(() => {
        formEditState.permissions = managePermission.value.getPermissionValue();
        if(isNew.value) {
          api.group.add(formEditState).then((data) => {
            message.success('新建组信息成功');
            if(data.data) {
              visibleEditDialog.value = false;
              loadTableData();
              updateUserGroups(data.data);
            }
          }).catch((e) => {
            message.error('新建组信息失败：' + e);
          });
        } else {
          api.group.update(formEditState.id, formEditState).then(() => {
            message.success('更新组信息成功');
            updateUserGroups(formEditState.id);
          }).catch((e) => {
            message.error('更新组信息失败：' + e);
          });
        }
      })
      .catch(() => { /* */ });
    };
    const handleEdit = (record: IGroupInfo) => {
      visibleEditDialog.value = true;
      isNew.value = false;
      common.cloneValue(formEditState, record);
      api.user.getList({
        search: {
          group_id: record.id,
        }
      }).then((data) => {
        if(data.data)
          dataCurrentGroupIds.value = data.data.map((d) => d.id).join(';');
      });
      setTimeout(() => {
        managePermission.value.setPermissionValue(record.permissions);
      }, 500);
    };
    const handleDelete = (record: IGroupInfo) => {
      Modal.confirm({
        title: '确认删除组?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '删除组将导致组下所有用户组更改为默认组，这会导致许多权限问题，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.group.delete(record.id).then(() => {
              message.success('删除组成功');
              loadTableData();
              resolve();
            }).catch((e) => {
              message.error('删除组失败' + e)
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
      formEditState.permissions = '';
      formEditState.belone_app_id = -1;
      formEditState.name = '';
      formEditState.accessable_app = '';
      formEditState.non_accessable_app = '';
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
      dataCurrentGroupIds,
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

      getPermisionCount(str: string) {
        return common.isNullOrEmpty(str) ? 0 : StringUtils.getCharCount(str, ';') + 1;
      },
      filterSelectOption(input: string, option: { name: string })  {
        return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      keyExctrator(row: IGroupInfo) { return row.id },
    }
  },
})
</script>

