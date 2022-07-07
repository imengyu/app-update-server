import { createApp } from 'vue'
import App from './App.vue'
import {
  Input,
  InputNumber,
  Button,
  Modal,
  Spin,
  Menu,
  Layout,
  Icon,
  Radio,
  Checkbox,
  ConfigProvider,
  Alert,
  Tabs,
  Dropdown,
  Row,
  Col,
  Collapse,
  Card,
  Form,
  Upload,
  Empty,
  List,
  Statistic,
  Progress,
  Result,
  Switch,
  Divider,
  Tag,
  Badge,
  Breadcrumb,
  Select,
  Transfer,
  Table,
  DatePicker,
  TimePicker,
  Pagination,
  Drawer,
  Steps,
  Popconfirm,
} from 'ant-design-vue';
import "ant-design-vue/dist/antd.css";
import './assets/scss/index.scss';
import './utils/extends'
import router from './router'
import store from './store'
import cScrollbar from 'c-scrollbar';
import { createFromIconfontCN } from '@ant-design/icons-vue';
import ShowInList from './components/ShowInList.vue';
import ShowValueOrNull from './components/ShowValueOrNull.vue';

const IconFont = createFromIconfontCN({
  scriptUrl: '//imengyu.top/assets/icons/iconfont-bped-03.js',
});

const app = createApp(App).use(store).use(router)
app.use(ConfigProvider)
app.component('icon-font', IconFont).component('show-value-or-null', ShowValueOrNull).component('show-in-list', ShowInList)
app.use(Empty).use(Form).use(Tag).use(Divider).use(Badge).use(Input).use(Upload).use(Button).use(InputNumber).use(Result).use(Card).use(List).use(Steps)
app.use(Dropdown).use(Row).use(Col).use(Collapse).use(Switch).use(Alert).use(Modal).use(Breadcrumb).use(Table).use(Select).use(Transfer).use(Drawer)
app.use(Spin).use(Menu).use(Layout).use(Radio).use(Tabs).use(Checkbox).use(Statistic).use(Icon).use(DatePicker).use(TimePicker).use(Pagination).use(Progress)
app.use(cScrollbar)
app.use(Popconfirm)
app.mount('#app')


