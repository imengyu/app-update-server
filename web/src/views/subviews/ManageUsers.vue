<template>
  <div>
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <a-button class="float-left" type="primary" @click="handleNew">
        <template #icon><PlusOutlined /></template>
        添加用户
      </a-button>
      <a-form-item label="搜索登录名" name="user">
        <a-input v-model:value="formSearchState.user" />
      </a-form-item>
      <a-form-item label="搜索用户名字" name="name">
        <a-input v-model:value="formSearchState.name" />
      </a-form-item>
      <a-form-item label="筛选指定组" name="group">
        <a-select v-model:value="formSearchState.group" show-search :filter-option="filterSelectOption" option-filter-prop="label" style="width:120px">
          <a-select-option v-for="(n, i) in groupNames" :key="i" :value="n.id" :name="n.name">{{ n.name }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleSearch">搜索</a-button>
        <a-button class="ml-3" @click="handleSearchReset">清空</a-button>
      </a-form-item>
    </a-form>
    <!--表格-->
    <a-table 
      :columns="columns"
      :row-key="(record) => record.id"
      :pagination="dataPagination"
      :data-source="dataSource"
      :loading="dataLoadStatus=='loading'"
      v-if="dataLoadStatus=='success'||dataLoadStatus=='loading'"
      @change="handleTableChange">
      <template #head="{ record }">
        <img class="vc-small-head" :src="getUserHead(record)" />
      </template>
      <template #group="{ record }">
        <span>
          <show-in-list :value="record.group_id" :list="groupNames" />
        </span>
      </template>
      <template #status="{ record }">
        <a-badge v-if="record.status==0" status="error" text="已注销" />
        <a-badge v-else-if="record.status==1" status="success" text="正常" />
        <a-badge v-else-if="record.status==2" status="warning" text="封禁" />
      </template>
      <template #permission="{ record }">
        <a-badge status="success" :text="getPermisionCount(record.grant_permissions) + ' 个特殊权限'" />
        <span class="ml-3">
          <a-badge status="error" :text="getPermisionCount(record.revoke_permissions) + ' 个禁止权限'" />
        </span>
        <span class="ml-3">
          <a @click="handleEditUserPermission(record)" v-if="record.status!=0">编辑权限</a>
        </span>
      </template>
      <template #action="{ record }">
        <span>
          <a @click="handleEditUser(record)" v-if="record.status!=0">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleBanUser(record)" v-if="record.status==1&&record.id!=1">封禁</a>
          <a @click="handleUnBanUser(record)" v-else-if="record.status==2&&record.id!=1">解封</a>
          <a-divider type="vertical" />
          <a @click="handleWithdrawUser(record)" v-if="record.status==1&&record.id!=1">注销</a>
        </span>
      </template>
    </a-table>
    <div v-else-if="dataLoadStatus=='failed'" class="error">
      <icon-font style="color: rgb(114, 36, 39);font-size:3em" type="icon-error-"/>
      <h1>数据加载失败</h1>
      <a-button type="link" @click="loadTableData">重试</a-button>
    </div>
    <!--编辑对话框-->
    <a-modal v-model:visible="visibleEditPermissionDialog" title="编辑权限" @ok="handleEditPermissionOk" :width="700">
      <ManageUserPermission ref="manageUserPermission" />
    </a-modal>
    <a-modal v-model:visible="visibleEditUserDialog" title="编辑用户" @ok="handleEditUserOk">
      <!--用户表单-->
      <a-form ref="formUser" :model="formUserState" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="用户名字" name="name">
          <a-input v-model:value="formUserState.name" />
        </a-form-item>
        <a-form-item label="所在组" name="group_id">
          <a-select v-model:value="formUserState.group_id" show-search :filter-option="filterSelectOption" option-filter-prop="label">
            <a-select-option v-for="(n, i) in groupNames" :key="i" :value="n.id" :name="n.name">{{ n.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>         
          <a-button type="primary" @click="handleResetPassword(formUserState)">重置密码</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="visibleEditUserPassDialog" title="更改用户密码" @ok="handleEditUserPassOk">
      <!--用户表单-->
      <a-form ref="formUserPass" :model="formUserPassState" :rules="formUserPassRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="提示">   
          更改密码是为了意外情况使用的，重置密码后当前用户将会强制去除登录状态。在更改密码后请及时通知对应员工。
        </a-form-item>
        <a-form-item label="新密码" name="pass">
          <a-input v-model:value="formUserPassState.pass" type="password" />
        </a-form-item>
        <a-form-item label="再输入一次" name="pass2">
          <a-input v-model:value="formUserPassState.pass2" type="password" />
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:visible="visibleNewUserDialog" title="添加用户" @ok="handleNewUserOk">
      <!--用户表单-->
      <a-form ref="formNewUser" :model="formNewUserState" :rules="formNewUserRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="登录名" name="user">
          <a-input v-model:value="formNewUserState.user" />
        </a-form-item>
        <a-form-item label="用户名" name="name">
          <a-input v-model:value="formNewUserState.name" />
        </a-form-item>
        <a-form-item label="所在组" name="group_id">
          <a-select v-model:value="formNewUserState.group_id" show-search :filter-option="filterSelectOption" option-filter-prop="label">
            <a-select-option v-for="(n, i) in groupNames" :key="i" :value="n.id" :name="n.name">{{ n.name }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import api, { apiRoot } from '@/api';
import { IUserInfo, User } from '@/api/user';
import common from '@/utils/common';
import StringUtils from '@/utils/string';
import ManageUserPermission, { IManageUserPermission } from './ManageUserPermission.vue'
import { Form } from '../../models/FormCommon'
import { message, Modal } from 'ant-design-vue';
import { createVNode, defineComponent } from 'vue'
import { Pagination, TableStateFilters } from '../../models/TableCommon'
import { ExclamationCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { Rule } from 'ant-design-vue/lib/form/interface';

const uploadHeadBaseUrl = apiRoot.substring(0, apiRoot.length - 1);

export default defineComponent({
  components: {
    ManageUserPermission,
    PlusOutlined
  },
  name: 'ManageUsers',
  data: () => {

    const columns = [
      {
        title: '',
        dataIndex: 'head',
        slots: { customRender: 'head' },
        width: 60,
      },
      {
        dataIndex: 'user',
        key: 'user',
        title: '登录名',
        sorter: true,
      },
      {
        dataIndex: 'name',
        key: 'name',
        title: '用户名字',
        sorter: true,
      },
      {
        title: '所在组',
        dataIndex: 'group_id',
        slots: { customRender: 'group' },
        sorter: true,
      },
      {
        title: '权限',
        dataIndex: 'permission',
        slots: { customRender: 'permission' },
      },
      {
        title: '状态',
        key: 'status',
        slots: { customRender: 'status' },
        filters: [
          {
            text: '已注销',
            value: 0,
          },
          {
            text: '正常',
            value: 1,
          },
          {
            text: '封禁',
            value: 2,
          },
        ]
      },
      {
        title: '操作',
        key: 'action',
        slots: { customRender: 'action' },
      },
    ];
    const groupNames: Array<{
      id: number;
      name: string;
    }> = []; 
    const dataSource = new Array<IUserInfo>();

    return {
      columns,
      groupNames,
      dataSource,
      dataPagination: {
        total: 0,
        current: 1,
        pageSize: 10,
      },
      dataSort: {
        field: "",
        order: "",
      },
      dataFilter: {},
      dataLoadStatus: 'notload',
      dataLoadError: '',
      formSearchState: {
        user: '',
        name: '',
        group: null,
      },
      formUserState: {} as IUserInfo,
      formUserPassState: {
        id: 0,
        pass: '',
        pass2: '',
      },
      formUserPassRules: {
        pass: [{ trigger: 'change' } as Rule],
        pass2: [{ trigger: 'change' } as Rule],
      },
      formNewUserRules: {
        user: [
          { required: true, message: '请输用户登录名', trigger: 'blur' },
          { max: 30, message: '登录名必须小于30个字符', trigger: 'blur' },
        ],
        name: [
          { required: true, message: '请输用户名', trigger: 'blur' },
          { max: 30, message: '用户名称必须小于30个字符', trigger: 'blur' },
        ]
      },
      formNewUserState: {} as IUserInfo,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      currentEditUser: null as null|IUserInfo,
      visibleEditPermissionDialog: false,
      visibleEditUserDialog: false,
      visibleEditUserPassDialog: false,
      visibleNewUserDialog: false,
    }
  },
  mounted() {
    this.loadGroupNames();
    this.loadTableData();
    setTimeout(() => {
      this.formUserPassRules.pass[0].validator = this.validatePass;
      this.formUserPassRules.pass2[0].validator = this.validatePass2;
    }, 500);
  },
  methods: {
    loadTableData(page?: number) {
      if(typeof page === 'number') this.dataPagination.current = page;
      this.dataLoadStatus = 'loading';
      api.user.getPage(this.dataPagination.current, this.dataPagination.pageSize, {
        search: {
          user: common.stringToSearchValue(this.formSearchState.user, true),
          name: common.stringToSearchValue(this.formSearchState.name, true),
          group_id: common.zeroOrNullToUndefined(this.formSearchState.group ),
        },
        sort: {
          field: common.emptyToUndefined(this.dataSort.field),
          order: common.emptyToUndefined(this.dataSort.order),
        },
        filter: this.dataFilter,
      }).then((data) => {
        this.dataLoadStatus = 'success';
        if(data.data) {
          this.dataPagination.total = data.data.allCount;
          this.dataSource = data.data.items;
        }
      }).catch((e) => {
        this.dataLoadStatus = 'failed';
        this.dataLoadError = e;
      })
    },
    loadGroupNames() {
      api.group.getList().then((data) => {
        this.groupNames = data.data || []
        this.groupNames.push({
          id: -1,
          name: '无'
        })
      }).catch((e) => message.warn('获取组数据失败！' + e));
    },

    async validatePass(rule: Rule, value: string) {
      if (value === '') {
        return Promise.reject('请输入密码');
      } else {
        if (this.formUserPassState.pass2 !== '') {
          (this.$refs.formUserPass as Form).validateFields(['pass2']);
        }
        return Promise.resolve();
      }
    },
    async validatePass2(rule: Rule, value: string) {
      if (value === '') {
        return Promise.reject('请再输入一次密码');
      } else if (value !== this.formUserPassState.pass) {
        return Promise.reject("两次输入密码不一致!");
      } else {
        return Promise.resolve();
      }
    },

    getUserHead(user: IUserInfo) {
      return (user.head && user.head != '') ? (uploadHeadBaseUrl + user.head) : require('../../assets/images/user.png');
    },
    getPermisionCount(str: string) {
      return common.isNullOrEmpty(str) ? 0 :  StringUtils.getCharCount(str, ';') + 1;
    },

    handleSearch() { 
      this.loadTableData(1); 
    },
    handleSearchReset() {
      if(this.$refs.formSearch != null)
        (this.$refs.formSearch as Form).resetFields();
      this.loadTableData(1);
    },
    handleTableChange(pag: Pagination, filters: TableStateFilters, sorter: { field: string; order: string }) {
      this.dataSort.field = sorter.field;
      this.dataSort.order = sorter.order;
      this.dataFilter = filters;
      this.loadTableData(pag?.current);
    },

    handleBanUser(user: IUserInfo) {
      Modal.confirm({
        title: '确认封禁用户?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '封禁用户将导致其不能登录，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.user.banUser(user.id).then(() => {
              message.success('封禁用户成功');
              user.status = 2;
              resolve();
            }).catch((e) => {
              message.error('封禁用户失败' + e)
              reject();
            })
          }).catch((e) => console.log(e));
        },
      });
    },
    handleUnBanUser(user: IUserInfo) {
      Modal.confirm({
        title: '确认解封用户?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '解封用户后用户将可以正常登录，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => {
            user.status = 1;
            api.user.update(user.id, user).then(() => {
              message.success('解封用户成功');
              resolve();
            }).catch((e) => {
              message.error('解封用户失败' + e)
              reject();
            })
          }).catch((e) => console.log(e));
        },
      });
    },
    handleWithdrawUser(user: IUserInfo) {
      const modal = Modal.confirm({
        title: '确认注销用户?',
        icon: createVNode(ExclamationCircleOutlined),
        content: createVNode('div', {}, [
          createVNode('b', null, '警告: 此操作将永久注销用户并且不能恢复!'),
          createVNode('br'),
          createVNode('span', null, '在注销该用户之前，您必须了解并且处理好以下事项：'),
          createVNode('ul', null, [
            createVNode('li', null, '该账号下不在处罚状态中，且能正常登录'),
            createVNode('li', null, '该账号内无资金，无任何未处理完毕的交易'),
            createVNode('li', null, '该账号无任何权力或义务纠纷'),
            createVNode('li', null, '该账号注销后数据无法再恢复，请自行对账号数据进行备份'),
          ]),
        ]),
        okType: 'danger',
        okText: '我已知晓',
        okButtonProps: { disabled: true },
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.user.withdrawUser(user.id).then(() => {
              message.success('注销用户成功');
              user.status = 0;
              resolve();
            }).catch((e) => {
              message.error('注销用户失败，请尝试重试：' + e)
              reject();
            })
          }).catch((e) => console.log(e));
        },
      });
      let modalCount = 10;
      const modalInterval = setInterval(() => {
        if(modalCount > 0) {
          modalCount--;
          modal.update({ okText: `我已知晓 (${modalCount})` });
        } else {
          modal.update({ okText: '我已知晓，继续注销', okButtonProps: { disabled: false } });
          clearInterval(modalInterval);
        }
      }, 1000);
    },
    handleResetPassword(user: IUserInfo) {
      this.visibleEditUserPassDialog = true;
      this.formUserPassState.id = user.id;
    },
    handleEditUserPassOk() {
      api.user.updateUserPass(this.formUserPassState.id, this.formUserPassState.pass).then(() => {
        message.success('更新用户密码成功');
        this.visibleEditUserPassDialog= false;
        this.loadTableData();
      }).catch((e) => {
        message.error('更新用户密码失败：' + e);
      })
    },
    handleEditUser(user: IUserInfo) {
      this.formUserState = user;
      this.visibleEditUserDialog = true;
    },
    handleEditUserOk() {
      api.user.update(this.formUserState.id, this.formUserState).then(() => {
        message.success('更新用户信息成功');
        this.visibleEditUserDialog= false;
        this.loadTableData();
      }).catch((e) => {
        message.error('更新用户信息失败：' + e);
      })
    },
    handleEditUserPermission(user: IUserInfo) {
      this.visibleEditPermissionDialog = true;
      this.currentEditUser = user;
      setTimeout(() => {       
        (this.$refs.manageUserPermission as IManageUserPermission).setPermissionValue(user.grant_permissions, user.revoke_permissions);
      }, 300);
    },
    handleEditPermissionOk() {
      if(this.currentEditUser) {
        const { grant, revoke } = (this.$refs.manageUserPermission as IManageUserPermission).getPermissionValue();
        this.currentEditUser.revoke_permissions = revoke;
        this.currentEditUser.grant_permissions = grant;
        api.user.update(this.currentEditUser.id, this.currentEditUser).then(() => {
          message.success('更新用户权限成功');
          this.visibleEditPermissionDialog= false;
          this.loadTableData();
        }).catch((e) => {
          message.error('更新用户权限失败：' + e);
        })
      }
    },
    handleNew() {
      this.visibleNewUserDialog = true;
      this.formNewUserState = new User();
      this.formNewUserState.group_id = -1;
    },
    handleNewUserOk() {
      (this.$refs.formNewUser as Form).validate().then(() => {
        api.user.add(this.formNewUserState).then(() => {
          this.visibleNewUserDialog = false;
          Modal.success({
            title: '提示',
            content: '添加用户成功，请编辑该用户并为其设置密码，然后改用户才能登录。'
          });
          this.loadTableData();
        }).catch((e) => {
          message.error('添加用户' + e);
        });
      }).catch(() => { /* */ });
    },
    filterSelectOption(input: string, option: { name: string })  {
      return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  },
})
</script>

