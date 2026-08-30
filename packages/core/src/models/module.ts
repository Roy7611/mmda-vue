import { hasBit } from "../extensions/number_extensions";

/**
 * 三级模块类型：系统、模块、功能
 */
export type ModuleType = "SYSTEM" | "MODULE" | "FEATURE";
/**
 * 模块标准操作枚举
 *
 * @remarks
 *
 * 定义：0;NONE;无|1;READ;读取|2;EDIT;编辑|4;CREATE;创建|8;DELETE;删除|15;CRUD;增删改查|16;REPORT;统计报表|32;IMPORT;导入|64;EXPORT;导出|128;UPLOAD;上传模板|255;ALL;所有
 *
 */
export const enum ModuleOp {
  NONE = 0, //0 无
  READ = 1, //0000 0001 读取
  EDIT = 2, //0000 0010 编辑
  CREATE = 4, //0000 0100 创建
  DELETE = 8, //0000 1000 删除
  PRINT = 16, //0001 0000 打印 => 统计报表
  EXPORT = 32, //0010 0000 导出
  IMPORT = 64, //0100 0000 导入
  UPLOAD = 128, //1000 0000 上传模版
}

/**
 * 模块版本枚举
 * @remarks
 * 定义：0;NONE;未定义|1;FREE;免费版|2;TEAM;团队版|4;PROFESSIONAL;专业版|8;ENTERPRISE_M;制造企业版|
 * 16;ENTERPRISE_B;贸易企业版|32;ENTERPRISE_L;物流企业版|64;ULTIMATE;旗舰版
 */
export const enum ModuleVersion {
  NONE = 0, //未定义
  FREE = 1, //免费版
  TEAM = 2, //团队版
  PROFESSIONAL = 4, //专业版
  ENTERPRISE_M = 8, //制造企业版
  ENTERPRISE_B = 16, //贸易企业版
  ENTERPRISE_L = 32, //物流企业版
  ULTIMATE = 64, //旗舰版
}

/**
 * 模块类型 0;DEV;开发中|1;TESTING;测试中|2;RELEASED;已发布|-1;DEPRECATED;已停用
 */
export const enum ModuleStatus {
  DEV = "DEV",
  TESTING = "TESTING",
  RELEASED = "RELEASED",
  DEPRECATED = "DEPRECATED",
}

/**
 * 模块操作按钮应用在哪些界面
 * 0;NONE;无|1;READ;详情|2;EDIT;编辑|4;LIST;列表
 */
export const enum ModuleActionMode {
  NONE = 0, //无
  READ = 1, //详情
  EDIT = 2, //编辑
  LIST = 4, //列表
}

/**
 * 模块操作交互类型
 * 交互类型：0;NONE;-|1;CONFIRM;确认|2;FLOW_TO;流转|4;MULTIPLE_SELECT;多选
 */
export const enum ModuleActionPromptType {
  NONE = 'NONE', //无
  CONFIRM = 'CONFIRM', //确认
  FLOW_TO = 'FLOW_TO', //流转
  MULTIPLE_SELECT = 'MULTIPLE_SELECT', //多选
}

/**
 * 模块操作类型
 * 操作类型：0;USER_TASK;用户任务|1;SERVICE_TASK;服务任务|2;DICISION;自动判断
 */
export const enum ModuleActionType {
  USER_TASK = 0, // 用户任务
  SERVICE_TASK = 1, // 服务任务
  DICISION = 2, // 自动判断
}

/**
 * 模块操作显示提示
 * 显示暗示：0;INFO;信息|1;SUCCESS;成功|2;WARNING;警告|4;DANGER;危险
 */
export const enum ModuleDisplayHint {
  INFO = 'INFO', //信息
  SUCCESS = 'SUCCESS', //成功
  WARNING = 'WARNING', //警告
  DANGER = 'DANGER' //危险
}

/**
 * 模块，定义一套软件系统的功能单元
 */
export interface Module {
  [index: string]: any;
  /** 模块编码，A.01.001 */
  moduleCode: string;

  /** 模块标签*/
  moduleLabel: string;

  /** 短标签*/
  shortLabel?: string;

  /** 模块类型：0;SYSTEM;子系统|1;MODULE;模块组|2;FEATURE;功能项*/
  moduleType: ModuleType;

  /** 模块图标*/
  moduleIcon?: string;

  /**
   * 属于版本：0;NONE;未定义|1;FREE;免费版|2;TEAM;团队版|4;PROFESSIONAL;专业版|8;ENTERPRISE_M;制造企业版|
   * 16;ENTERPRISE_B;贸易企业版|32;ENTERPRISE_L;物流企业版|64;ULTIMATE;旗舰版
   *
   */
  moduleVersion: ModuleVersion;

  /** 数据库名称*/
  dbName?: string;

  /** 元对象名称*/
  objName?: string;

  /**
   * 允许的标准操作位掩码。
   * 定义：0;NONE;无|1;READ;读取|2;EDIT;编辑|4;CREATE;创建|8;DELETE;删除|15;CRUD;增删改查|16;REPORT;统计报表|32;IMPORT;导入|64;EXPORT;导出|128;UPLOAD;上传模板|255;ALL;所有
   */
  allowOps: ModuleOp;

  /** 模块Url*/
  moduleUrl: string;

  /** 必须有创建参数*/
  requiredCreateParam: boolean;

  /** 默认过滤器*/
  defaultFilter?: string;

  /** 默认排序*/
  defaultSort?: string;

  /** 状态：0;未发布|1;测试中|2;已发布|-1;已停用*/
  status: ModuleStatus;

  /** 描述*/
  description?: string;

  /** 子模块树（asTree=1 时由服务端嵌套返回）*/
  subModules?: Module[];

  /**
   * 是否分隔线
   */
  divider: boolean;

  /**
   * 用户授权（服务端 RoleModuleAuth 合并结果）；无 authority 时工厂按 allowOps 拆解。
   */
  authority?: ModuleAuth;
}

/**
 * 模块操作
 * @remarks moduleCode:模块编码 actionCode:操作编码 actionModes:操作模式 actionName:操作名称 actionType:操作类型 description:操作描述 displayHint:操作提示 displayIcon:操作提示图标 displayLabel:操作提示标签 ownerOnly:仅负责人允许 promptType:操作交互类型 executableExpression:执行表达式
 */
export interface ModuleAction {
  moduleCode: string;
  actionCode: string;
  actionModes: ModuleActionMode;
  actionName: string;
  actionType?: ModuleActionType;
  displayHint?: ModuleDisplayHint;
  displayIcon?: string;
  displayLabel?: string;
  description?: string;
  ownerOnly?: boolean;
  promptType?: ModuleActionPromptType;
  executableExpression?: string;
}

/**
 * 模块权限
 */
export interface ModuleAuth {
  allowRead: boolean;
  allowEdit: boolean;
  allowCreate: boolean;
  allowDelete: boolean;
  allowPrint: boolean;
  allowExport: boolean;
  allowImport: boolean;
  allowUpload: boolean;
  authScope?: string;
  authActions?: string;
  authRule?: string;
  authorizedActions?: ModuleAction[];
}

/**
 * 将 allowOps 位掩码拆解为标准权限结构
 * @param allowOps ModuleOp 位组合
 * @returns ModuleAuth
 */
export function auth(allowOps: ModuleOp): ModuleAuth {
  return {
    allowRead: hasBit(allowOps, ModuleOp.READ),
    allowEdit: hasBit(allowOps, ModuleOp.EDIT),
    allowCreate: hasBit(allowOps, ModuleOp.CREATE),
    allowDelete: hasBit(allowOps, ModuleOp.DELETE),
    allowPrint: hasBit(allowOps, ModuleOp.PRINT),
    allowExport: hasBit(allowOps, ModuleOp.EXPORT),
    allowImport: hasBit(allowOps, ModuleOp.IMPORT),
    allowUpload: hasBit(allowOps, ModuleOp.UPLOAD),
  };
}

/**
 * 模块工厂管理系统功能模块，提供构建三级模块树和按Url查找
 * @see {@link MetaUiService} 使用
 */
export class ModuleFactory {
  readonly urlModules: Record<string, Module>;
  readonly entityModules: Record<string, Module>;
  constructor(public readonly modules: Module[]) {
    this.urlModules = {};
    this.entityModules = {};
    modules.forEach((module) => this.defineModule(module));
  }

  defineModule(module: Module, parent?: Module) {
    Object.defineProperty(module, "id", {
      get: function () {
        return this.moduleCode;
      },
      enumerable: true,
    });
    // 优先使用服务端返回的用户授权；仅当未附带 authority 时才从 allowOps 拆解能力位。
    // 冻结副本：属性槽不可替换，CRUD 标志与 authorizedActions 也不可改。
    // Object.freeze 的 Readonly 与 ModuleAuth 可变声明不兼容，运行时已冻结，断言回 ModuleAuth。
    const source = module.authority || auth(module.allowOps ?? 0);
    const frozen = Object.freeze({
      ...source,
      authorizedActions: Object.freeze([...(source.authorizedActions ?? [])]),
    }) as ModuleAuth;
    Object.defineProperty(module, "authority", {
      value: frozen,
      writable: false,
      configurable: false,
      enumerable: true,
    });
    Object.defineProperty(module, "parent", {
      get: function () {
        return parent;
      },
      enumerable: false,
    });
    if (module.moduleUrl) this.urlModules[module.moduleUrl] = module;
    if (module.objName) this.entityModules[module.objName] = module;
    if (module.subModules && module.subModules.length > 0) {
      module.subModules.forEach((subModule) =>
        this.defineModule(subModule, module),
      );
    }
  }

  findModuleByUrl(moduleUrl: string): Module | undefined {
    const pos = moduleUrl.indexOf("?");
    if (pos != -1) moduleUrl = moduleUrl.substring(0, pos - 1);
    let module = this.urlModules[moduleUrl];
    if (module) return module;

    const tryUrl = "/" + moduleUrl.split("/").slice(1, 3).join("/");

    return this.urlModules[tryUrl];
  }
  findModuleByName(entityName: string): Module | undefined {
    return this.entityModules[entityName];
  }
}
