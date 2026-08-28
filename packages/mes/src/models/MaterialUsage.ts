import { Entity, defineEntity, defineEntityArray } from '@mmda/core';

/**
 * 用料分析
 * 
 * @remarks 用料分析
 * 
 * @author mmda codebot 
 * @version 4.0.0 
 * @since 2024-08-18 10:30:05.0
 * 
 */
export interface MaterialUsage extends Entity {
}
/**
 * 用料分析实体定义函数
 */
export const defineMaterialUsage = (o: object) => {
    const e = defineEntity<MaterialUsage>(o);
    //定义id
    Object.defineProperty(e, 'id', {
        get: function () { return this.stationID }
    });
    return e;
}