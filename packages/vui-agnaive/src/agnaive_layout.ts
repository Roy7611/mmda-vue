import { VueUiLayout } from '@mmda/vui'

/** listTile 走 AbstractUiLayout 三槽 nowrap flex，不覆写。 */
export class AgNaiveLayout extends VueUiLayout {}

export const agNaiveLayout = new AgNaiveLayout()
