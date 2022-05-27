import { NamePath } from "ant-design-vue/lib/form/interface";

export interface Form {
  /**
   * 触发表单验证, 同 validateFields	
   */
  validate: (nameList?: NamePath[]) => Promise<unknown>;
  /**
   * 触发表单验证
   */
  validateFields: (nameList?: NamePath[]) => Promise<unknown>;
  /**
   * 滚动到对应字段位置
   */
  scrollToField: (name: NamePath, options: [ScrollOptions]) => void;
  /**
   * 对整个表单进行重置，将所有字段值重置为初始值并移除校验结果
   */
  resetFields: () => void;
  /**
   * 移除表单项的校验结果。传入待移除的表单项的 name 属性或者 name 组成的数组，如不传则移除整个表单的校验结果	
   */
  clearValidate: (name?: Array<string> | string) => void;
}


export interface FormValidRules {
  [index: string]: {
    /**
     * 枚举类型
     */
    enum?: string;
    /**
     * 字段长度
     */
    len?: number;
    /**
     * 最大长度
     */
    max?: number;
    /**
     * 校验文案
     */
    message?: string;
    /**
     * 最小长度
     */
    min?: number;
    /**
     * 正则表达式校验
     */
    pattern?: RegExp;
    /**
     * 是否必选
     */
    required?: boolean;
    /**
     * 校验前转换字段值
     */
    transform?: (value: unknown) => unknown;
    /**
     * 校验触发的时机
     */
    trigger?: 'blur' | 'change' | ['change', 'blur'];
    /**
     * 	内建校验类型，可选项	
     */
    type?: string;
    /**
     * 自定义校验（注意，callback 必须被调用）	
     */
    validator?: (rule: unknown, value: unknown, callback?: () => void) => Promise<void>;
    /**
     * 必选时，空格是否会被视为错误
     */
    whitespace?: boolean;
  }[];
}