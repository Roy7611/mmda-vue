/**
 * 流程提交 / 待办通知的目标数据（审批人、部门、紧急度、抄送）。
 * 元数据形状，不是界面动作。
 */
export interface FlowToModel {
  ownerID: string
  ownerName: string | object
  ownerDeptID: string
  ownerDeptName: string
  /** 重要性 */
  importance: string
  /** 紧急性 */
  urgency: string
  /** 待办事宜 */
  notification: string
  /** 通知给 */
  copyTo: unknown[]
}
