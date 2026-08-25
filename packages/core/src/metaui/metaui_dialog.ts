export type MetaUiColorRole = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'danger'

export enum MetaUiDialogButton{
    ok = 1,
    yes = 2,
    cancel = 4,
    no = 8,
}
export type MetaUiDialogButtonType = keyof typeof MetaUiDialogButton;
export type MetaUiMessageBoxResult = MetaUiDialogButtonType;
export interface MetaUiMessageBoxProps{
    message:any;
    title?: string;
    role?: MetaUiColorRole;
    buttons?: MetaUiDialogButtonType[];
    beforeConfirm?: ()=>boolean|Promise<boolean>;
}

