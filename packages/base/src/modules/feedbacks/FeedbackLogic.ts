/**
 * Copyright (c) 2006, 2024, www.syclive.com All rights reserved.
 * MMDA.CLOUD PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from "vue-router";
import {
  type MetaUiService,
  type Module,
  type MetaUiField,
  type UiContext,
  MetaModel,
  EntityAction,
  isNullOrUndefined,
  ApiClient,
} from "@mmda/core";
import {
  type UiLogicInit,
  UiLogic,
  UiGroupLogic,
  type UiLogicFnResult,
  UiViewOne,
} from "@mmda/vui";
import { type Feedback, defineFeedback } from "../../models/Feedback";
import {
  type FeedbackPhoto,
  defineFeedbackPhoto,
} from "../../models/FeedbackPhoto";
import { NoticeFn } from "../../components/NoticeFn";
import { reactive } from "vue";
/**
 * 反馈交互逻辑
 * @author mmda codebot
 * @since 2024-07-17 07:38:58.0
 * @revision 2024-08-09 22:22:32.0
 */
//#region ~GENERATED PARTS BEGIN
/**
 * 反馈交互逻辑
 */
const notice = reactive({
  data: {
    ownerID: "",
    ownerName: "",
    ownerInvalid: false, //显示用 是否选择了用户
    ownerDeptID: "",
    ownerDeptName: "",
    importance: "UNKNOWN", //重要性
    urgency: "NORMAL", //紧急性
    notification: "", //待办事宜
    copyTo: [], //通知给
    copyToInvalid: false, //是否选择了 通知给谁。
  },
});
// // 回答
// const beforeAnswer = async (context: UiContext, model: Feedback, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Submit'),
// 	data: notice.data,
// 	id: model.feedbackID ?? '',
// 	action: 'answer',
// 	repository: 'Feedbacks',
// 	detail: context.globalProps.$t('auth.SubmitSuccess')
// })
// // 关闭
// const beforeClose = async (context: UiContext, model: Feedback, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Submit'),
// 	data: notice.data,
// 	id: model.feedbackID ?? '',
// 	action: 'close',
// 	repository: 'Feedbacks',
// 	detail: context.globalProps.$t('auth.SubmitSuccess')
// })
// // 打开
// const beforeOpen = async (context: UiContext, model: Feedback, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Submit'),
// 	data: notice.data,
// 	id: model.feedbackID ?? '',
// 	action: 'open',
// 	repository: 'Feedbacks',
// 	detail: context.globalProps.$t('auth.SubmitSuccess')
// })
// // 解决
// const beforeResolve = async (context: UiContext, model: Feedback, action: EntityAction) => NoticeFn(context, {
// 	title: context.globalProps.$t('auth.Submit'),
// 	data: notice.data,
// 	id: model.feedbackID ?? '',
// 	action: 'resolve',
// 	repository: 'Feedbacks',
// 	detail: context.globalProps.$t('auth.SubmitSuccess')
// })
export class FeedbackLogic extends UiLogic<Feedback> {
  constructor(init: UiLogicInit) {
    super(defineFeedback, init);
    this.addRelativeLogic<FeedbackPhoto>(
      "photos",
      (master) => new FeedbackPhotoLogic(this, master),
    );
    // this.beforeAction = (context: UiContext, model: Feedback, action: EntityAction) => {
    // 	// try {
    // 	// 	if (action.name == 'answer') return beforeAnswer(context, model, action);
    // 	// 	if (action.name == 'close') return beforeClose(context, model, action);
    // 	// 	if (action.name == 'open') return beforeOpen(context, model, action);
    // 	// 	if (action.name == 'resolve') return beforeResolve(context, model, action);
    // 	// 	else return Promise.resolve(true);
    // 	// } catch (error: any) {
    // 	// 	return Promise.resolve(false);
    // 	// }
    // };
  }
  beforeIndex(): UiLogicFnResult<Feedback> {
    const { fields, groups, customActions } = super.beforeIndex();
    if (fields.length === 0) {
      fields.push(
        this.field("ownerID").searchable(true),
        this.field("creatorID").searchable(true),
      );
    }
    return { fields, groups, customActions };
  }
  /**
   * 设置编辑交互逻辑
   */
  beforeEdit() {
    const { fields, groups, customActions } = super.beforeEdit();
    if (fields.length == 0) {
      /**
			fields.push(
				this.field('fldName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange<string>((ctx,model,newVal,oldVal)=>{ })
					.onValidate<string>((value,model)=>{ })
			);
			 */
    }
    if (groups.length == 0) {
      groups.push(
        this.group<FeedbackPhoto>("photos").addCustomAction({
          name: "createContractItem",
          label: "action.create",
          icon: "far fa-plus-circle",
          role: "info",
          onAction: this.newFeedbackPhoto,
          view: UiViewOne.Edit,
        }),
      );
      /**
			fields.push(
				this.group<I>('grpName')
					.lockIf(model=>model.prop1)
					.hideIf(model=>model.prop2)
					.onChange((ctx,model,items)=>{ })
			);
			 */
    }
    return { fields, groups, customActions };
  }

  /**
   * 创建反馈截图
   * @param context 界面上下文
   * @param target 项目模板
   */
  newFeedbackPhoto(context: UiContext, target: Feedback) {
    context
      .newSubGroupItem<FeedbackPhoto>({
        group: "photos",
        sequenceKey: "itemID",
        target,
      })
      .then((item) => {
        if (item) {
          context.addSubGroupItem("photos", item);
        }
      });
  }
  //设置详情逻辑
  //beforeDetails(){}
}

/**
 * 构造反馈交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const FeedbackLogicCtor = (
  metaUiService: MetaUiService,
  router: Router,
  module?: Module,
) =>
  new FeedbackLogic({
    metaUiService: metaUiService,
    repository: "Feedbacks",
    router,
    module: module || metaUiService.findModule("Feedback"),
  });
/**
 * 照片交互逻辑
 */
export class FeedbackPhotoLogic extends UiGroupLogic<FeedbackPhoto, Feedback> {
  constructor(parent: FeedbackLogic, master: Feedback) {
    super(defineFeedbackPhoto, parent, master, "photos");
  }
}
//#endregion ~GENERATED PARTS END
