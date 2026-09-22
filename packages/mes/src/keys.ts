import { UI_APP_KEY } from '@mmda/core'
import type { InjectionKey } from 'vue'
import type {MmdaApplication} from '@mmda/core'
export const APP_NAME = 'MES'

export const MES_KEY = UI_APP_KEY as InjectionKey<MmdaApplication>
