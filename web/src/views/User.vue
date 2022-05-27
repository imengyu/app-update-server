<template>
  <div>
    <a-row class="bg-white">
      <a-col :span="12" class="p-4 pt-3 d-flex">
        <img v-if="userInfo" :src="headBaseUrl+userInfo.head" class="vc-avatar" />
        <div v-if="userInfo" class="display-inline-block ml-3">
          <h1 class="m-0" style="font-size:2em">早安，{{userInfo.name}}，开始您一天的工作吧！</h1>
          <span>今日阴转小雨，22℃ - 32℃，出门记得带伞哦。</span>
        </div>
      </a-col>
      <a-col :span="3">
        <a-statistic title="任务数" :value="6" />
      </a-col>
      <a-col :span="3">
        <a-statistic title="代办事项" :value="4" />
      </a-col>
      <a-col :span="3">
        <a-statistic title="工作事项" :value="0" />
      </a-col>
      <a-col :span="3">
        <a-statistic title="数据数" :value="112893" />
      </a-col>
    </a-row>
    <a-row class="p-4">
      <a-col :span="24" > 
        <a-card title="快捷操作" class="vc-action-card">
          <a-card-grid style="width: 12.5%; text-align: center"><PieChartFilled style="color: rgb(82, 196, 26);" />数据中心</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><SlidersFilled style="color: rgb(24, 144, 255);" />数据管理</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><FundFilled style="color: rgb(250, 173, 20);" />数据大屏</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><icon-font style="color: rgb(114, 46, 209);" type="icon-filter-1"/>控制中心</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><icon-font style="color: rgb(19, 194, 194);" type="icon-tasks-"/>我的事项</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><icon-font style="color: rgb(235, 47, 150);" type="icon-search-"/>搜索</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><icon-font style="color: rgb(82, 202, 24);" type="icon-settings-2"/>设置</a-card-grid>
          <a-card-grid style="width: 12.5%; text-align: center"><icon-font style="color: #696186" type="icon-new_custom19"/>工具</a-card-grid>
        </a-card>
      </a-col>
    </a-row>
    <a-row class="p-4 pt-0">
      <a-col :span="18"> 
        <a-card title="我的任务">
          <a-list
            item-layout="horizontal"
            :data-source="worksListData"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a>立即查看</a>
                  <a>添加至稍后处理</a>
                </template>
                <a-list-item-meta :description="item.desp">
                  <template #title>
                    <a>{{ item.name }}</a>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :span="6" class="pl-4"> 
        <a-card title="代办事项">
          <template #extra><a href="javascript:;" title="添加代办事项"><icon-font type="icon-pluss-2"/></a></template>
          <a-list
            item-layout="horizontal"
            :data-source="todoListData"
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a title="编辑"><icon-font style="color:rgb(235, 47, 150);" type="icon-edit-1"/></a>
                  <a title="完成"><icon-font style="color:rgb(82, 196, 26);" type="icon-flag-1"/></a>
                </template>
                <a-list-item-meta :description="item.content">
                  <template #title>
                    <a>{{ item.title }}</a>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
    <a-row>
      
    </a-row>
  </div>
</template>

<script lang="ts">
import { useStore } from 'vuex';
import { computed, defineComponent, ref } from 'vue'
import { apiRoot } from '@/api';
import { 
  PieChartFilled,
  SlidersFilled,
  FundFilled,
} from '@ant-design/icons-vue';
export default defineComponent({
  name: 'User',
  components: {
    PieChartFilled,
    SlidersFilled,
    FundFilled,
  },
  setup() {
    const activeKey = ref('');
    const store = useStore();
    const headBaseUrl = apiRoot.substring(0, apiRoot.length-1);
    const userInfo = computed(() => store.getters.userInfo);
    const worksListData = [
      {
        name: '信息管理科2021年4月工作安排',
        desp: '2021-03-01 13:13:34',
      },
      {
        name: '优化思想管理科2021年本月工作安排',
        desp: '2021-03-13 14:46:34',
      },
      {
        name: '项目管理任务【8】',
        desp: '2021-03-02 17:25:14',
      },
      {
        name: '合同审批问题【2】',
        desp: '2021-01-02 13:15:34',
      },
      {
        name: 'A类报告审计局20210182审核',
        desp: '2021-03-02 08:13:42',
      },
      {
        name: '自定义任务',
        desp: '2021-01-28 15:24:09',
      },
    ];
    const todoListData = [
      {
        title: '完成设计图',
        content: '2月1日之前完成李先生设计图',
      },
      {
        title: '预算',
        content: '3月1日进行项目预算报价单',
      },
      {
        title: '项目',
        content: '天界项目吴先生，物管手续交底。',
      },
      {
        title: '系统维护',
        content: '在3月5日进行系统数据的升级与迁移',
      }
    ];

    return {
      todoListData,
      worksListData,
      headBaseUrl,
      userInfo,
      activeKey
    }
  }
})
</script>

