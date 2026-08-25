import { UI_APP_KEY } from '@mmda/vui'
import type { InjectionKey } from 'vue'
import type { MmdaApplication } from '@mmda/vui'

export const APP_NAME = 'BASE'

export const MMDA_BASE_KEY = UI_APP_KEY as InjectionKey<MmdaApplication>
