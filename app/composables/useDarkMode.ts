export const useDarkMode = () => {
  const isDark = useState<boolean>('darkMode', () => false)

  function applyTheme(dark: boolean) {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', dark)
    }
  }

  function toggle() {
    isDark.value = !isDark.value
    applyTheme(isDark.value)
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
  }

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = saved !== null ? saved === 'dark' : prefersDark
      isDark.value = dark
      applyTheme(dark)
    }
  }

  return { isDark, toggle, init }
}
