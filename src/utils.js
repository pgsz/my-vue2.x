/**
 * 判断指定标签是否为自闭合标签
 */
export default function isUnaryTag(tagName) {
  // 自闭合标签 。。。
  const tags = ['input']
  return tags.includes(tagName)
}
