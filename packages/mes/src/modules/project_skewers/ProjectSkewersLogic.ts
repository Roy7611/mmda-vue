/**
 * Copyright (c) 2006, 2020, www.syclive.com All rights reserved.
 * Syc PROPRIETARY/CONFIDENTIAL. Use is subject to license terms.
 *
 * Please don't modify any code between GENERATED PARTS BEGIN and END
 *
 */
import { Router } from 'vue-router';
import { MetaUiService, Module, MetaUiField, ApiClient, MetaModel, isRefNone, debounce, isNullOrUndefined, isObject, triggerEscKey } from '@mmda/core';
import type { UiLogicInit, UiLogicFnResult } from '@mmda/vui';
import { UiLogic } from '@mmda/vui';
import { primeVueFactory } from '@/compat/primevue_legacy'
import { reactive, h, toRaw, ref, RendererElement, RendererNode, VNode, getCurrentInstance } from 'vue';
import { type CustomPage, defineCustomPage } from '@/models/CustomPage';

/**
 * 项目串烧交互逻辑
 * @author mmda codebot
 * @since 2023-11-28 00:20:38.0
 * @revision 2023-11-28 01:38:08.0
 */
export class ProjectSkewersLogic extends UiLogic<CustomPage> {
    constructor(init: UiLogicInit) {
        super(defineCustomPage, init);
    }
    beforeIndex() {
        const { fields, groups, customActions } = super.beforeIndex();
        if (fields.length == 0) {
        }
        return { fields, groups, customActions };
    }
}
/**
 * 构造项目串烧交互逻辑
 * @param metaUiService 元数据服务
 * @param router 路由
 * @param module 模块
 * @returns
 */
export const ProjectSkewersLogicCtor = (metaUiService: MetaUiService, router: Router, module?: Module) =>
    new ProjectSkewersLogic({
        metaUiService: metaUiService,
        repository: 'StationPortals',
        router,
        module: module || metaUiService.findModule('StationPortal'),
    });