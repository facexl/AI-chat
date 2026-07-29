export function useTheme() {
  const isDark = ref(false)

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(dark: boolean) {
    isDark.value = dark
  }

  return { isDark, toggle, setDark }
}
