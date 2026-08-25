/*
 * 框架公共方法。debounce / 树工具可在 Node 使用；`triggerEscKey` 依赖 DOM。
 */
export const debounce = <T extends (...args: any[]) => void>(
  callback: T,
  delay = 300,
) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  return function (this: unknown, ...args: Parameters<T>) {
    if (timer !== undefined) clearTimeout(timer)
    timer = setTimeout(() => {
      callback.apply(this, args)
    }, delay)
  }
}

export const throttle = <T extends (...args: any[]) => void>(
  callback: T,
  limit = 300,
) => {
  let lastRun: number | undefined
  return function (this: unknown, ...args: Parameters<T>) {
    const now = Date.now()
    if (lastRun === undefined || now - lastRun >= limit) {
      lastRun = now
      callback.apply(this, args)
    }
  }
}

/**
 * 在 document 上派发 Escape（关闭弹层）。仅浏览器。
 */
export const triggerEscKey = (callback?: (...args: any[]) => void) => {
  const escEvent = new KeyboardEvent('keydown', {
    key: 'Escape',
    keyCode: 27,
    code: 'Escape',
    which: 27,
    bubbles: true,
    cancelable: true,
  })
  document.dispatchEvent(escEvent)
  callback?.()
}


/**
 * 对树形结构进行map映射
 * @param root 根结点
 * @param mapper 映射函数
 * @param children 结点的子结点key
 * @returns 映射后的树形结构
 */
export const mapTree = (
  root: any,
  mapper: (node: any) => any,
  children: string = 'children',
) => {
  if (!root) return null

  const newNode = mapper(root)
  const kids = root[children]
  if (kids && kids.length) {
    newNode[children] = kids.map((child: any) =>
      mapTree(child, mapper, children),
    )
  } else {
    newNode[children] = []
  }

  return newNode
}

/**
 * 通过检查其ID，检查数组A中的每个元素是否是数组B的子集。
 * @param arrA 检查阵列
 * @param arrB 检查的阵列
 * @param key 检查的钥匙
 * @returns 如果ARRA中的每个元素在ARRB中
 */
export const isSubsetByKey = (arrA: any[], arrB: any[], key: string): boolean => {
    // 将数组B的id存入Set，方便快速查找
    const idSet = new Set(arrB.map(item => item[key]));
    // 检查数组A中的每个id是否都在Set中存在
    return arrA.every(item => idSet.has(item[key]));
}

/**
 * 获取节点及其所有父节点的路径
 * 输入树形数据和目标节点，输出从目标节点到根节点的路径数组（包含目标节点及其所有祖先节点）
 * 
 * @param tree 树形数据，可以是单个节点对象或节点数组
 * @param targetNode 目标节点或目标节点的唯一标识（如 id）
 * @param matchKey 用于匹配节点的键名，默认为 'id'。如果 targetNode 是对象，将使用该键进行匹配；如果 targetNode 是原始值，直接与该键的值比较
 * @param childrenKey 子节点数组的键名，默认为 'children'
 * @returns 从根到目标节点的路径数组。未找到则返回空数组
 * 
 * @example
 * // 获取节点及其父节点路径
 * const tree = { 
 *   id: '1', 
 *   name: 'Root',
 *   children: [
 *     { id: '2', name: 'Child 1', children: [{ id: '3', name: 'Grandchild 1' }] },
 *     { id: '4', name: 'Child 2' }
 *   ]
 * };
 * // 传入节点对象
 * const path = getNodePath(tree, { id: '3', name: 'Grandchild 1' });
 * // 输出: [{ id: '3', name: 'Grandchild 1' }, { id: '2', name: 'Child 1' }, { id: '1', name: 'Root' }]
 * 
 * // 传入节点 id
 * const path2 = getNodePath(tree, '3');
 * // 输出: [{ id: '3', name: 'Grandchild 1' }, { id: '2', name: 'Child 1' }, { id: '1', name: 'Root' }]
 * 
 * @example
 * // 处理多个根节点的树数组
 * const treeArray = [
 *   { id: 'a', name: 'Root A', children: [{ id: 'a1', name: 'Child A1' }] },
 *   { id: 'b', name: 'Root B' }
 * ];
 * const path3 = getNodePath(treeArray, 'a1');
 * // 输出: [{ id: 'a1', name: 'Child A1' }, { id: 'a', name: 'Root A' }]
 * 
 * @example
 * // 未找到节点时返回空数组
 * const path4 = getNodePath(tree, 'nonexistent');
 * // 输出: []
 */
export const getNodePath = (
    tree: any | any[],
    targetNode: any,
    matchKey: string = 'id',
    childrenKey: string = 'children'
): any[] => {
    // 确定目标值
    const targetValue = typeof targetNode === 'object' && targetNode !== null 
        ? targetNode[matchKey] 
        : targetNode;

    const findPath = (node: any, parentPath: any[]): any[] | null => {
        // 如果节点为空，返回 null
        if (!node || typeof node !== 'object') {
            return null;
        }

        // 检查当前节点是否是目标节点
        if (node[matchKey] === targetValue) {
            return [...parentPath, node];
        }

        // 如果有子节点，递归查找
        if (node[childrenKey] && Array.isArray(node[childrenKey])) {
            for (const child of node[childrenKey]) {
                const result = findPath(child, [...parentPath, node]);
                if (result) {
                    return result;
                }
            }
        }

        // 未找到
        return null;
    };

    // 如果是数组，遍历每个根节点
    if (Array.isArray(tree)) {
        for (const node of tree) {
            const result = findPath(node, []);
            if (result) {
                return result;
            }
        }
    }
    // 如果是单个节点对象
    else if (tree !== null && typeof tree === 'object') {
        const result = findPath(tree, []);
        if (result) {
            return result;
        }
    }

    // 未找到目标节点，返回空数组
    return [];
}



