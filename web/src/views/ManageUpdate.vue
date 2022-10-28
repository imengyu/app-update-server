<template>
  <div class="p-4">
    <!--查询表单-->
    <a-form ref="formSearch" class="vc-search-form" :model="formSearchState" layout="inline">
      <div class="float-left d-flex flex-row text-left">
        <a-button type="primary" @click="handleNew" :disabled="!formSearchState.app_id">
          <template #icon><PlusOutlined /></template>
          发布更新
        </a-button>
        <a-select class="ml-3" style="width:200px;text-align:left;" v-model:value="formSearchState.app_id" show-search placeholder="选择对应应用"  :filter-option="filterSelectOption" option-filter-prop="label" @change="handleSearch">
          <a-select-option v-for="(n, i) in appNames" :key="i" :value="n.id" :name="n.name">{{ n.name }}</a-select-option>
        </a-select>
      </div>
      <a-form-item v-if="formSearchState.app_id" label="搜索发布版本" name="version_name">
        <a-input v-model:value="formSearchState.version_name" />
      </a-form-item>
      <a-form-item v-if="formSearchState.app_id" label="搜索版本号" name="version_code">
        <a-input v-model:value="formSearchState.version_code" />
      </a-form-item>
      <a-form-item v-if="formSearchState.app_id">
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
      <template #status="{ record }">
        <a-badge v-if="record.status=='enabled'" status="success" text="正常" />
        <a-badge v-else-if="record.status=='disabled'" status="warning" text="暂停更新" />
        <a-badge v-else-if="record.status=='archived'" status="error" text="已归档" />
        <a-badge v-else status="warning" text="未知" />
      </template>
      <template #action="{ record }">
        <span>
          <a @click="handleEdit(record)">编辑</a>
          <a-divider type="vertical" />
          <a @click="handleDelete(record)">删除</a>
          <a-divider type="vertical" />
          <a @click="handleArchive(record)">归档</a>
        </span>
      </template>
    </a-table>
    <div v-else-if="dataLoadStatus=='failed'" class="error">
      <icon-font style="color: rgb(114, 36, 39);font-size:3em" type="icon-error-"/>
      <h1>数据加载失败</h1>
      <a-button type="link" @click="loadTableData">重试</a-button>
    </div>
    <div v-else-if="!formSearchState.app_id" class="error" style="padding: 100px 30px;margin-top: 50px;">
      <icon-font style="font-size:3em" type="icon-edit-1"/>
      <h1>在左上角选择你要发布更新的应用</h1>
    </div>
    <!--编辑对话框-->
    <a-modal v-model:visible="visibleEditDialog" :title="(isNew?'发布':'编辑')+'更新'" @ok="handleEditOk" width="86%">
      <a-form ref="formEdit" :model="formEditState" :rules="formEditRules" :label-col="labelCol" :wrapper-col="wrapperCol">
        <a-form-item label="版本名字（给用户看的）" name="version_name">
          <a-input v-model:value="formEditState.version_name" placeholder="给用户看的版本名字，例如1.0.0" />
        </a-form-item>
        <a-form-item label="版本号（用于程序判断，是数字）" name="version_code">
          <a-input-number v-model:value="formEditState.version_code" placeholder="版本号，例如 20053" :min="0" style="width: 200px;" />
        </a-form-item>
        <a-form-item label="更新内容文案" name="post_note">
          <a-textarea v-model:value="formEditState.post_note" showCount :maxlength="255"></a-textarea>
        </a-form-item>
        <a-form-item label="推送渠道" name="post_channels">
          <ChannelsSelector v-model:value="formEditState.post_channels" :list="channelNames" />
        </a-form-item>
        <a-form-item label="推送条件" name="post_version_code_mask">
          <PostRules ref="refPostRules" v-model:value="formEditState.post_version_code_mask" />
        </a-form-item>
        <a-form-item v-if="false" label="推送版本号(用户)匹配正则" name="post_version_name_mask">
          <a-input v-model:value="formEditState.post_version_name_mask" />
        </a-form-item>
        <a-form-item label="更新安装包下载URL" name="update_package_url">
          <a-input v-model:value="formEditState.update_package_url" />

          <div v-if="uploadProgress>= 0">
            <a-progress :percent="uploadProgress" />
          </div> 
          <div v-else>
            <a-upload
              name="file"
              :multiple="false"
              :showUploadList="false"
              :action="apiRoot+'update-file-post'"
              :headers="getAuthHeaders()"
              :beforeUpload="beforeFileUpload"
              :data="getUploadFileData"
              @change="handleUploadChange"
            >
              <a-button :disabled="uploadProgress >= 0">
                <upload-outlined></upload-outlined>
                上传到本地存储库
              </a-button>
            </a-upload>

            <a-upload
              v-if="canUseAliOss"
              class="ml-3"
              name="file"
              :showUploadList="false"
              :multiple="false"
              :customRequest="handleUploadAliOSS"
              @change="handleUploadChange"
            >
              <a-button :disabled="uploadProgress >= 0">
                <upload-outlined></upload-outlined>
                上传到 阿里云 OSS
              </a-button>
            </a-upload>
          </div>
        </a-form-item>
        <a-form-item v-if="false" label="更新安装包下载URL（热更新）" name="update_hot_update_url">
          <a-input v-model:value="formEditState.update_hot_update_url" />
        </a-form-item>
        <a-form-item label="状态" name="code">
          <a-badge v-if="formEditState.status=='archived'" status="error" text="已归档" />
          <a-select v-else class="ml-3" v-model:value="formEditState.status">
            <a-select-option value="enabled"><a-badge status="success" text="启用更新" /></a-select-option>
            <a-select-option value="disabled"><a-badge status="error" text="暂停更新" /></a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts">
import api, { LoadStatus, apiRoot, getAuthHeaders, IKeyValue } from '@/api';
import common from '@/utils/common';
import { message, Modal } from 'ant-design-vue';
import { computed, createVNode, defineComponent, onMounted, reactive, ref } from 'vue'
import { Pagination, TableStateFilters } from '../models/TableCommon'
import { ExclamationCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { IUpdateInfo } from '@/api/update';
import { useRoute } from 'vue-router';
import { IAppInfo } from '@/api/app';
import ChannelsSelector from './components/ChannelsSelector.vue';
import PostRules from './components/PostRules.vue';
import { FileInfo, FileItem } from '@/models/FileUpload';
import OSS from 'ali-oss';
import { getAliOSSClient, getAliOSSUploadUrl } from '@/utils/upload/uploadAliOSS';
import storage from '@/api/storage';
import { useStore } from 'vuex';

export default defineComponent({
  components: {
    PlusOutlined,
    UploadOutlined,
    ChannelsSelector,
    PostRules,
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
        title: '更新版本号',
        sorter: true,
      },
      {
        dataIndex: 'version_code',
        key: 'version_code',
        title: '版本代码',
        sorter: true,
      },
      {
        dataIndex: 'date',
        key: 'date',
        title: '发布时间',
        defaultSortOrder: 'descend',
        sorter: true,
      },
      {
        dataIndex: 'post_note',
        key: 'post_note',
        title: '更新简介',
      },
      {
        slots: { customRender: 'status' },
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
      field: "date",
      order: "descend",
    });
    const dataFilter = ref({});
    const dataLoadStatus = ref<LoadStatus>('notload');
    const dataLoadError = ref('');
    const visibleEditDialog = ref(false);
    const isNew = ref(false);

    const channelNames = ref<IKeyValue>([]); 
    const appNames = ref<IAppInfo[]>([]); 

    const route = useRoute();

    const formSearch = ref();
    const refPostRules = ref();
    const formSearchState = reactive({
      version_name: '',
      version_code: '',
      app_id: parseInt(route.query.app_id as string) || null as null|number,
    });    
    
    const formEdit = ref();
    const formEditState = reactive<IUpdateInfo>({
      date: new Date().format(),
      status: 'enabled',
      id: 0,
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
        { required: true, message: '请输入版本号', trigger: 'blur', type: 'number' },
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
    function loadChannelNames() {
      api.channel.getList({ full: true }).then((data) => {
        
        channelNames.value = data.data?.map((k) => ({
          label: `${k.name} (${k.code})`,
          value: k.code,
        })) || [];
      }).catch((e) => message.warn('获取渠道数据失败！' + e));
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
        formEditState.post_version_code_mask = refPostRules.value.getValue();
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
    const handleArchive = (record: IUpdateInfo) => {
      Modal.confirm({
        title: '确认将更新归档?',
        icon: createVNode(ExclamationCircleOutlined),
        content: '为节省空间，归档将删除更新文件，仅保留更新信息，无法恢复，是否继续?',
        onOk: () => {
          return new Promise<void>((resolve, reject) => { 
            api.update.archive(record.id).then((d) => {
              message.success('归档更新成功');
              if(d.data?.storage_id)
                api.storage.delete(d.data.storage_id)
                  .then(() => message.success('更新文件删除成功'))
                  .catch((e) => message.error('更新文件删除失败' + e));
              loadTableData();
              resolve();
            }).catch((e) => {
              message.error('归档更新失败' + e)
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

    const store = useStore();
    const userInfo = computed(() => store.getters.userInfo);

    const uploadProgress = ref(-1);

    //普通上传
    //=======================================

    function handleUploadChange(info: FileInfo) {
      if (info.file.status === 'uploading') {
        uploadProgress.value = Math.floor(info.file.percent * 100);
      } else if (info.file.status === 'done') {
        uploadProgress.value = -1;
        formEditState.update_package_url = (info.file.response as any).data.path;
        message.success(`${info.file.name} 上传成功`);
      } else if (info.file.status === 'error') {
        uploadProgress.value = -1;
        message.error(`${info.file.name} 上传失败.`);
      }
    }

    let uploadHeadKey = '';
    function beforeFileUpload(file: FileItem)  {
      const isLt256M = file.size / 1024 / 1024 < 256;
      if (!isLt256M) 
        message.error('安装包大小必须小于 256MB!');
      return new Promise<void>((resolve, reject) => {
        if(isLt256M) {
          api.user.getUserUploadKey().then((key) => {
            if(key.data)
              uploadHeadKey = key.data.key;
            resolve();
          }).catch(reject);
        } else reject();
      });  
    }
    function getUploadFileData() {
      return {
        key: uploadHeadKey
      }
    }

    //阿里云上传
    //=======================================

    const aliOSSClient = ref<OSS|null>(null)
    const canUseAliOss = ref(false);

    function handleUploadAliOSS(obj: {
      onProgress: (event: { percent: number }) => void;
      onError: (event: Error, body?: object) => void;
      onSuccess: (body: object) => void;
      data: object;
      filename: string;
      file: File;
      withCredentials: boolean;
      action: string;
      headers: object;
    }) {
      aliOSSClient.value?.multipartUpload(obj.file.name, obj.file, {
        headers: obj.headers,
        // 获取分片上传进度、断点和返回值。
        progress: (p) => {
          obj.onProgress({ percent: p });
        },
      }).then(() => {
        const aliOSSPath = getAliOSSUploadUrl(obj.file.name);
        obj.onSuccess({
          data: { path: aliOSSPath }
        });

        //添加存储
        storage.add({
          third_storage_path: 'ali-oss:' + obj.file.name,
          date: new Date().format(),
          abs_path: aliOSSPath,
          local_path: '',
          using_status: 0,
          upload_user_id: userInfo.value.id,
        })

      }).catch((e) => {
        obj.onError(e);
      })
    }

    onMounted(() => {
      if (formSearchState.app_id)
        loadTableData(1);
      loadChannelNames();
      loadGroupNames();
      getAliOSSClient().then((d) => {
        aliOSSClient.value = d;
        canUseAliOss.value = true;
      });
    });

    return {
      managePermission,
      canUseAliOss,
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
      channelNames,
      appNames,
      refPostRules,

      apiRoot,
      uploadProgress,
      handleUploadAliOSS,
      handleUploadChange,
      beforeFileUpload,
      getUploadFileData,
      getAuthHeaders,

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
      handleArchive,

      loadGroupNames,
      filterSelectOption(input: string, option: { name: string })  {
        return option.name.toLowerCase().indexOf(input.toLowerCase()) >= 0;
      },
      keyExctrator(row: IUpdateInfo) { return row.id },
    }
  },
})
</script>

