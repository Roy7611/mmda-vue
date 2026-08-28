import { UI_APP_KEY } from '@mmda/vui'
import type { InjectionKey } from 'vue'
import type { MmdaApplication } from '@mmda/vui'

export const APP_NAME = 'MES'

export const MES_KEY = UI_APP_KEY as InjectionKey<MmdaApplication>
export const MMDA_MES_KEY = MES_KEY
