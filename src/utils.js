/**
 * 判断指定标签是否为自闭合标签
 */
export function isUnaryTag(tagName) {
  // 自闭合标签 。。。
  const tags = ['input']
  return tags.includes(tagName)
}

/**
 * 判断标签是否为平台保留标签
*/
export function isReserveTag(tagName){
  const reserveTag = ['div', 'h3', 'span', 'input', 'select', 'option', 'p', 'button', 'template']
  return reserveTag.includes(tagName)
}
