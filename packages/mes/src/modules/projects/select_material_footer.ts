import { h } from 'vue'

export function confirmCenterNode(text: string) {
	return h('div', { class: 'confirmCenter' }, [text])
}
