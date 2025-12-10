export default function Menu(menuName) {
  const menu = {
    context: document.querySelector(`#${menuName}`),
    isOpen: false,
    items: [],
    target: "",
  }

  function open(x = 0, y = 0) {
    menu.isOpen = true
    menu.context.style.display = "block"
    menu.context.style.left = `${x}px`
    menu.context.style.top = `${y}px`
  }
  menu.open = open

  function close() {
    menu.isOpen = false
    menu.context.style.display = "none"
    console.log("closed")
  }
  menu.close = close

  function registerItem(item) {
    menu.items.push(item)
  }

  function registerItems(items = []) {
    for (const item of items) {
      registerItem(item)
    }
  }
  menu.registerItems = registerItems

  function build() {
    for (const item of menu.items) {
      const element = document.createElement("div")
      element.textContent = item.name
      element.addEventListener("click", () => {
        item.click(menu.target)
      })
      element.classList.add("menu-item")
      element.id = item.id
      menu.context.append(element)
    }
    menu.context.addEventListener("mouseleave", close)
  }
  menu.build = build

  return menu
}
